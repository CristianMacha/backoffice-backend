import { DomainException } from './domain.exception';

export abstract class ConflictDomainException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
