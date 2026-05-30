import { DomainException } from './domain.exception';

export abstract class NotFoundDomainException extends DomainException {
  constructor(resource: string, id: string) {
    super(`${resource} with id '${id}' not found`);
  }
}
