export abstract class DomainEvent {
  readonly occurredAt: Date;
  readonly eventId: string;
  abstract readonly eventName: string;

  constructor() {
    this.occurredAt = new Date();
    this.eventId = crypto.randomUUID();
  }
}
