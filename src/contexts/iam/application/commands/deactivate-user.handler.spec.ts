import { EventPublisher } from '@nestjs/cqrs';
import { DeactivateUserHandler } from './deactivate-user.handler';
import { DeactivateUserCommand } from './deactivate-user.command';
import { FakeUserRepository } from '../../test/fakes/fake-user.repository';
import { UserBuilder } from '../../test/builders/user.builder';
import { UserStatus } from '../../domain/user/user-status.enum';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { CannotDeactivateSelfException } from '../../domain/exceptions/cannot-deactivate-self.exception';

const makePublisher = () =>
  ({ mergeObjectContext: (x: unknown) => x }) as unknown as EventPublisher;

describe('DeactivateUserHandler', () => {
  let handler: DeactivateUserHandler;
  let userRepo: FakeUserRepository;

  beforeEach(() => {
    userRepo = new FakeUserRepository();
    handler = new DeactivateUserHandler(userRepo, makePublisher());
  });

  it('deactivates an active user', async () => {
    const user = new UserBuilder()
      .withId('user-1')
      .withStatus(UserStatus.ACTIVE)
      .build();
    userRepo.seed(user);

    const result = await handler.execute(new DeactivateUserCommand('user-1', 'requester-99'));

    expect(result.status).toBe(UserStatus.INACTIVE);
    const persisted = await userRepo.findById('user-1');
    expect(persisted?.status).toBe(UserStatus.INACTIVE);
  });

  it('throws UserNotFoundException when user does not exist', async () => {
    await expect(
      handler.execute(new DeactivateUserCommand('nonexistent', 'requester-99')),
    ).rejects.toThrow(UserNotFoundException);
  });

  it('throws CannotDeactivateSelfException when requester targets themselves', async () => {
    const user = new UserBuilder()
      .withId('user-1')
      .withStatus(UserStatus.ACTIVE)
      .build();
    userRepo.seed(user);

    await expect(
      handler.execute(new DeactivateUserCommand('user-1', 'user-1')),
    ).rejects.toThrow(CannotDeactivateSelfException);
  });
});
