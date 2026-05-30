import { NotFoundDomainException } from '../../../../shared/exceptions';

export class UserNotFoundException extends NotFoundDomainException {
  readonly errorCode = 'USER_NOT_FOUND';

  constructor(id: string) {
    super('User', id);
  }
}
