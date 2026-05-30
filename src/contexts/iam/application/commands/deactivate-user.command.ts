export class DeactivateUserCommand {
  constructor(
    readonly userId: string,
    readonly requesterId: string,
  ) {}
}
