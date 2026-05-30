import { ConflictDomainException } from '../../../../shared/exceptions';

export class UserAlreadyExistsException extends ConflictDomainException {
  readonly errorCode = 'USER_ALREADY_EXISTS';

  constructor(field: 'email' | 'firebaseUid', value: string) {
    super(`User with ${field} '${value}' already exists`);
  }
}
