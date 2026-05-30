import { ValidationDomainException } from '../../../../shared/exceptions';

export class CannotChangeOwnRoleException extends ValidationDomainException {
  readonly errorCode = 'CANNOT_CHANGE_OWN_ROLE';

  constructor() {
    super('A user cannot change their own role');
  }
}
