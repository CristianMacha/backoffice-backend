export abstract class QueryBase {
  readonly queryId: string;
  readonly createdAt: Date;

  constructor() {
    this.queryId = crypto.randomUUID();
    this.createdAt = new Date();
  }
}
