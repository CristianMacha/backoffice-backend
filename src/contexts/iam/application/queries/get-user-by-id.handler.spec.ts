import { GetUserByIdHandler } from './get-user-by-id.handler';
import { GetUserByIdQuery } from './get-user-by-id.query';
import { FakeUserRepository } from '../../test/fakes/fake-user.repository';
import { UserBuilder } from '../../test/builders/user.builder';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';

describe('GetUserByIdHandler', () => {
  let handler: GetUserByIdHandler;
  let userRepo: FakeUserRepository;

  beforeEach(() => {
    userRepo = new FakeUserRepository();
    handler = new GetUserByIdHandler(userRepo);
  });

  it('returns the user when found', async () => {
    const user = new UserBuilder()
      .withId('user-1')
      .withEmail('a@b.com')
      .build();
    userRepo.seed(user);

    const result = await handler.execute(new GetUserByIdQuery('user-1'));

    expect(result.id).toBe('user-1');
    expect(result.email.value).toBe('a@b.com');
  });

  it('throws UserNotFoundException when user does not exist', async () => {
    await expect(
      handler.execute(new GetUserByIdQuery('nonexistent')),
    ).rejects.toThrow(UserNotFoundException);
  });
});
