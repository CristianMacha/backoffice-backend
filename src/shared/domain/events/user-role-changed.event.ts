import { DomainEvent } from '../domain-event.base';

export class UserRoleChangedEvent extends DomainEvent {
  readonly eventName = 'iam.user.role-changed';

  constructor(
    readonly userId: string,
    readonly newRoleId: string,
    readonly previousRoleId: string,
  ) {
    super();
  }
}
