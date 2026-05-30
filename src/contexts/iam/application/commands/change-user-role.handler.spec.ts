import { EventPublisher } from '@nestjs/cqrs';
import { ChangeUserRoleHandler } from './change-user-role.handler';
import { ChangeUserRoleCommand } from './change-user-role.command';
import { FakeUserRepository } from '../../test/fakes/fake-user.repository';
import { FakeRoleRepository } from '../../test/fakes/fake-role.repository';
import { UserBuilder } from '../../test/builders/user.builder';
import { RoleBuilder } from '../../test/builders/role.builder';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { RoleNotFoundException } from '../../domain/exceptions/role-not-found.exception';
import { CannotChangeOwnRoleException } from '../../domain/exceptions/cannot-change-own-role.exception';

const makePublisher = () =>
  ({ mergeObjectContext: (x: unknown) => x }) as unknown as EventPublisher;

describe('ChangeUserRoleHandler', () => {
  let handler: ChangeUserRoleHandler;
  let userRepo: FakeUserRepository;
  let roleRepo: FakeRoleRepository;

  beforeEach(() => {
    userRepo = new FakeUserRepository();
    roleRepo = new FakeRoleRepository();
    handler = new ChangeUserRoleHandler(userRepo, roleRepo, makePublisher());
  });

  it('changes the user role', async () => {
    const user = new UserBuilder()
      .withId('user-1')
      .withRoleId('old-role')
      .build();
    const newRole = new RoleBuilder().withId('new-role').build();
    userRepo.seed(user);
    roleRepo.seed(newRole);

    const updated = await handler.execute(
      new ChangeUserRoleCommand('user-1', 'new-role', 'requester-99'),
    );

    expect(updated.roleId).toBe('new-role');
    const persisted = await userRepo.findById('user-1');
    expect(persisted?.roleId).toBe('new-role');
  });

  it('throws CannotChangeOwnRoleException when user tries to change their own role', async () => {
    await expect(
      handler.execute(new ChangeUserRoleCommand('user-1', 'any-role', 'user-1')),
    ).rejects.toThrow(CannotChangeOwnRoleException);
  });

  it('throws UserNotFoundException when user does not exist', async () => {
    const role = new RoleBuilder().withId('role-1').build();
    roleRepo.seed(role);

    await expect(
      handler.execute(new ChangeUserRoleCommand('nonexistent', 'role-1', 'requester-99')),
    ).rejects.toThrow(UserNotFoundException);
  });

  it('throws RoleNotFoundException when new role does not exist', async () => {
    const user = new UserBuilder().withId('user-1').build();
    userRepo.seed(user);

    await expect(
      handler.execute(new ChangeUserRoleCommand('user-1', 'nonexistent-role', 'requester-99')),
    ).rejects.toThrow(RoleNotFoundException);
  });
});
