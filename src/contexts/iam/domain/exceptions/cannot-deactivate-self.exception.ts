import { ValidationDomainException } from '../../../../shared/exceptions';

export class CannotDeactivateSelfException extends ValidationDomainException {
  readonly errorCode = 'CANNOT_DEACTIVATE_SELF';

  constructor() {
    super('A user cannot deactivate their own account');
  }
}
