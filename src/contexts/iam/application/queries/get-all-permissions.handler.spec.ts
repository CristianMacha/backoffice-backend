import { GetAllPermissionsHandler } from './get-all-permissions.handler';
import { GetAllPermissionsQuery } from './get-all-permissions.query';
import { FakePermissionRepository } from '../../test/fakes/fake-permission.repository';
import { PermissionBuilder } from '../../test/builders/permission.builder';
import { Permissions } from '../../domain/permission/permissions';

describe('GetAllPermissionsHandler', () => {
  let handler: GetAllPermissionsHandler;
  let permissionRepo: FakePermissionRepository;

  beforeEach(() => {
    permissionRepo = new FakePermissionRepository();
    handler = new GetAllPermissionsHandler(permissionRepo);
  });

  it('returns empty array when no permissions exist', async () => {
    const result = await handler.execute(new GetAllPermissionsQuery());
    expect(result).toHaveLength(0);
  });

  it('returns all seeded permissions', async () => {
    permissionRepo.seed(
      new PermissionBuilder().withName(Permissions.USERS.READ).build(),
    );
    permissionRepo.seed(
      new PermissionBuilder().withName(Permissions.DASHBOARD.VIEW).build(),
    );

    const result = await handler.execute(new GetAllPermissionsQuery());

    expect(result).toHaveLength(2);
    const names = result.map((p) => p.name);
    expect(names).toContain(Permissions.USERS.READ);
    expect(names).toContain(Permissions.DASHBOARD.VIEW);
  });
});
