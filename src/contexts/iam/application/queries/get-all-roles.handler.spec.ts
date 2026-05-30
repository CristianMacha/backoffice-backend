import { GetAllRolesHandler } from './get-all-roles.handler';
import { GetAllRolesQuery } from './get-all-roles.query';
import { FakeRoleRepository } from '../../test/fakes/fake-role.repository';
import { RoleBuilder } from '../../test/builders/role.builder';
import { Role as RoleEnum } from '../../domain/role/role.enum';
import { Permissions } from '../../domain/permission/permissions';

describe('GetAllRolesHandler', () => {
  let handler: GetAllRolesHandler;
  let roleRepo: FakeRoleRepository;

  beforeEach(() => {
    roleRepo = new FakeRoleRepository();
    handler = new GetAllRolesHandler(roleRepo);
  });

  it('returns empty array when no roles exist', async () => {
    const result = await handler.execute(new GetAllRolesQuery());
    expect(result).toHaveLength(0);
  });

  it('returns all seeded roles', async () => {
    roleRepo.seed(
      new RoleBuilder()
        .withName(RoleEnum.ADMIN)
        .withPermissions(Permissions.USERS.READ)
        .build(),
    );
    roleRepo.seed(new RoleBuilder().withName(RoleEnum.USER).build());

    const result = await handler.execute(new GetAllRolesQuery());

    expect(result).toHaveLength(2);
    const names = result.map((r) => r.name);
    expect(names).toContain(RoleEnum.ADMIN);
    expect(names).toContain(RoleEnum.USER);
  });
});
