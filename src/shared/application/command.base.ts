export abstract class CommandBase {
  readonly commandId: string;
  readonly createdAt: Date;

  constructor() {
    this.commandId = crypto.randomUUID();
    this.createdAt = new Date();
  }
}
