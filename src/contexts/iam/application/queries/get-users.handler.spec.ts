import { GetUsersHandler } from './get-users.handler';
import { GetUsersQuery } from './get-users.query';
import { FakeUserRepository } from '../../test/fakes/fake-user.repository';
import { UserBuilder } from '../../test/builders/user.builder';

describe('GetUsersHandler', () => {
  let handler: GetUsersHandler;
  let userRepo: FakeUserRepository;

  beforeEach(() => {
    userRepo = new FakeUserRepository();
    handler = new GetUsersHandler(userRepo);
  });

  it('returns empty paginated result when no users exist', async () => {
    const result = await handler.execute(
      new GetUsersQuery({ page: 1, limit: 10 }),
    );
    expect(result.data).toHaveLength(0);
    expect(result.meta.total).toBe(0);
    expect(result.meta.totalPages).toBe(0);
  });

  it('returns paginated users', async () => {
    for (let i = 0; i < 5; i++) {
      userRepo.seed(
        new UserBuilder()
          .withEmail(`user${i}@example.com`)
          .withFirebaseUid(`uid-${i}`)
          .build(),
      );
    }

    const result = await handler.execute(
      new GetUsersQuery({ page: 1, limit: 3 }),
    );

    expect(result.data).toHaveLength(3);
    expect(result.meta.total).toBe(5);
    expect(result.meta.totalPages).toBe(2);
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(3);
  });

  it('returns second page correctly', async () => {
    for (let i = 0; i < 5; i++) {
      userRepo.seed(
        new UserBuilder()
          .withEmail(`user${i}@example.com`)
          .withFirebaseUid(`uid-${i}`)
          .build(),
      );
    }

    const result = await handler.execute(
      new GetUsersQuery({ page: 2, limit: 3 }),
    );

    expect(result.data).toHaveLength(2);
    expect(result.meta.page).toBe(2);
  });

  it('returns empty data for page beyond total', async () => {
    userRepo.seed(new UserBuilder().build());

    const result = await handler.execute(
      new GetUsersQuery({ page: 5, limit: 10 }),
    );

    expect(result.data).toHaveLength(0);
    expect(result.meta.total).toBe(1);
  });
});
