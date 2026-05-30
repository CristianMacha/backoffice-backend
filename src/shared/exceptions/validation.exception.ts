import { DomainException } from './domain.exception';

export abstract class ValidationDomainException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
