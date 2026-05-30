import { ValueObject } from '../../../../shared/domain/value-object.base';
import { Result, ok, err } from '../../../../shared/utils/result';
import { InvalidEmailException } from '../exceptions/invalid-email.exception';

interface EmailProps {
  value: string;
  [key: string]: unknown;
}

export class Email extends ValueObject<EmailProps> {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(props: EmailProps) {
    super(props);
  }

  static create(raw: string): Result<Email, InvalidEmailException> {
    const normalized = raw.trim().toLowerCase();
    if (!Email.EMAIL_REGEX.test(normalized)) {
      return err(new InvalidEmailException(raw));
    }
    return ok(new Email({ value: normalized }));
  }

  get value(): string {
    return this.props.value;
  }
}
