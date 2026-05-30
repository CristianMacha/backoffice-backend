import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateRolePermissionsCommand } from './update-role-permissions.command';
import {
  IRoleRepository,
  ROLE_REPOSITORY,
} from '../../domain/role/role.repository.interface';
import { Role } from '../../domain/role/role.entity';
import { RoleNotFoundException } from '../../domain/exceptions/role-not-found.exception';

@CommandHandler(UpdateRolePermissionsCommand)
export class UpdateRolePermissionsHandler implements ICommandHandler<
  UpdateRolePermissionsCommand,
  Role
> {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(command: UpdateRolePermissionsCommand): Promise<Role> {
    const role = await this.roleRepository.findById(command.roleId);
    if (!role) throw new RoleNotFoundException(command.roleId);

    await this.roleRepository.replacePermissions(
      command.roleId,
      command.permissionIds,
    );

    const updated = await this.roleRepository.findById(command.roleId);
    return updated!;
  }
}
