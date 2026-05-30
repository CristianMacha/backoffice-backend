import { UpdateRolePermissionsHandler } from './update-role-permissions.handler';
import { UpdateRolePermissionsCommand } from './update-role-permissions.command';
import { FakeRoleRepository } from '../../test/fakes/fake-role.repository';
import { RoleBuilder } from '../../test/builders/role.builder';
import { RoleNotFoundException } from '../../domain/exceptions/role-not-found.exception';
import { Role as RoleEnum } from '../../domain/role/role.enum';

describe('UpdateRolePermissionsHandler', () => {
  let handler: UpdateRolePermissionsHandler;
  let roleRepo: FakeRoleRepository;

  beforeEach(() => {
    roleRepo = new FakeRoleRepository();
    handler = new UpdateRolePermissionsHandler(roleRepo);
  });

  it('delegates permission replacement to the repository', async () => {
    const role = new RoleBuilder()
      .withId('role-1')
      .withName(RoleEnum.ADMIN)
      .build();
    roleRepo.seed(role);

    await expect(
      handler.execute(
        new UpdateRolePermissionsCommand('role-1', ['perm-id-1']),
      ),
    ).resolves.not.toThrow();
  });

  it('throws RoleNotFoundException when role does not exist', async () => {
    await expect(
      handler.execute(new UpdateRolePermissionsCommand('nonexistent', [])),
    ).rejects.toThrow(RoleNotFoundException);
  });
});
