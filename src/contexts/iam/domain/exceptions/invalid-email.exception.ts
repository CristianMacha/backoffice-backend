import { ValidationDomainException } from '../../../../shared/exceptions';

export class InvalidEmailException extends ValidationDomainException {
  readonly errorCode = 'INVALID_EMAIL';

  constructor(email: string) {
    super(`'${email}' is not a valid email address`);
  }
}
