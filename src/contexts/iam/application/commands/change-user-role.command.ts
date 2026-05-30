export class ChangeUserRoleCommand {
  constructor(
    readonly userId: string,
    readonly newRoleId: string,
    readonly requesterId: string,
  ) {}
}
