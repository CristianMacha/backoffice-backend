import { EventPublisher } from '@nestjs/cqrs';
import { CreateUserHandler } from './create-user.handler';
import { CreateUserCommand } from './create-user.command';
import { FakeUserRepository } from '../../test/fakes/fake-user.repository';
import { FakeRoleRepository } from '../../test/fakes/fake-role.repository';
import { RoleBuilder } from '../../test/builders/role.builder';
import { UserBuilder } from '../../test/builders/user.builder';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';
import { RoleNotFoundException } from '../../domain/exceptions/role-not-found.exception';
import { FirebaseAuthService } from '../../infrastructure/firebase/firebase-auth.service';

const makePublisher = () =>
  ({ mergeObjectContext: (x: unknown) => x }) as unknown as EventPublisher;

const makeFirebaseAuthService = (uid = 'firebase-uid-generated') =>
  ({
    createUser: jest.fn().mockResolvedValue({ uid }),
    deleteUser: jest.fn().mockResolvedValue(undefined),
  }) as unknown as FirebaseAuthService;

describe('CreateUserHandler', () => {
  let handler: CreateUserHandler;
  let userRepo: FakeUserRepository;
  let roleRepo: FakeRoleRepository;
  let firebaseAuth: FirebaseAuthService;

  beforeEach(() => {
    userRepo = new FakeUserRepository();
    roleRepo = new FakeRoleRepository();
    firebaseAuth = makeFirebaseAuthService();
    handler = new CreateUserHandler(userRepo, roleRepo, firebaseAuth, makePublisher());
  });

  it('creates a Firebase user and persists in DB', async () => {
    const role = new RoleBuilder().withId('role-1').build();
    roleRepo.seed(role);

    const user = await handler.execute(
      new CreateUserCommand('new@example.com', 'role-1'),
    );

    expect(firebaseAuth.createUser).toHaveBeenCalledWith('new@example.com');
    expect(user.firebaseUid).toBe('firebase-uid-generated');
    expect(user.email.value).toBe('new@example.com');
    expect(user.roleId).toBe('role-1');
    expect(userRepo.all()).toHaveLength(1);
  });

  it('throws UserAlreadyExistsException when email is already in DB', async () => {
    const role = new RoleBuilder().withId('role-1').build();
    const existing = new UserBuilder()
      .withEmail('taken@example.com')
      .withRoleId('role-1')
      .build();
    roleRepo.seed(role);
    userRepo.seed(existing);

    await expect(
      handler.execute(new CreateUserCommand('taken@example.com', 'role-1')),
    ).rejects.toThrow(UserAlreadyExistsException);

    expect(firebaseAuth.createUser).not.toHaveBeenCalled();
  });

  it('throws RoleNotFoundException when role does not exist', async () => {
    await expect(
      handler.execute(new CreateUserCommand('test@example.com', 'nonexistent-role')),
    ).rejects.toThrow(RoleNotFoundException);

    expect(firebaseAuth.createUser).not.toHaveBeenCalled();
  });

  it('rolls back Firebase user when DB save fails', async () => {
    const role = new RoleBuilder().withId('role-1').build();
    roleRepo.seed(role);
    jest.spyOn(userRepo, 'save').mockRejectedValueOnce(new Error('DB error'));

    await expect(
      handler.execute(new CreateUserCommand('fail@example.com', 'role-1')),
    ).rejects.toThrow('DB error');

    expect(firebaseAuth.createUser).toHaveBeenCalledWith('fail@example.com');
    expect(firebaseAuth.deleteUser).toHaveBeenCalledWith('firebase-uid-generated');
  });

  it('throws UserAlreadyExistsException when email already exists in Firebase', async () => {
    const role = new RoleBuilder().withId('role-1').build();
    roleRepo.seed(role);
    (firebaseAuth.createUser as jest.Mock).mockRejectedValueOnce({
      code: 'auth/email-already-exists',
    });

    await expect(
      handler.execute(new CreateUserCommand('taken@firebase.com', 'role-1')),
    ).rejects.toThrow(UserAlreadyExistsException);
  });
});
