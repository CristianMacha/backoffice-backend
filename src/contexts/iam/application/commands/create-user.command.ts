export class CreateUserCommand {
  constructor(
    readonly email: string,
    readonly roleId: string,
  ) {}
}
