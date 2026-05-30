import { DomainEvent } from '../domain-event.base';

export class UserCreatedEvent extends DomainEvent {
  readonly eventName = 'iam.user.created';

  constructor(
    readonly userId: string,
    readonly firebaseUid: string,
    readonly email: string,
    readonly roleId: string,
  ) {
    super();
  }
}
