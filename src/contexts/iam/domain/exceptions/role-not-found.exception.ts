import { NotFoundDomainException } from '../../../../shared/exceptions';

export class RoleNotFoundException extends NotFoundDomainException {
  readonly errorCode = 'ROLE_NOT_FOUND';

  constructor(id: string) {
    super('Role', id);
  }
}
