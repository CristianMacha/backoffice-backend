export class UpdateRolePermissionsCommand {
  constructor(
    readonly roleId: string,
    readonly permissionIds: string[],
  ) {}
}
