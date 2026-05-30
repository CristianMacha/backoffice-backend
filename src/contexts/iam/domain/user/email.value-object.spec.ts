import { Email } from './email.value-object';
import { InvalidEmailException } from '../exceptions/invalid-email.exception';

describe('Email value object', () => {
  describe('create()', () => {
    it('creates a valid email', () => {
      const result = Email.create('User@Example.COM');
      expect(result.isOk).toBe(true);
      if (result.isOk) expect(result.value.value).toBe('user@example.com');
    });

    it('normalizes to lowercase', () => {
      const result = Email.create('ADMIN@DOMAIN.COM');
      expect(result.isOk).toBe(true);
      if (result.isOk) expect(result.value.value).toBe('admin@domain.com');
    });

    it('trims whitespace', () => {
      const result = Email.create('  user@example.com  ');
      expect(result.isOk).toBe(true);
      if (result.isOk) expect(result.value.value).toBe('user@example.com');
    });

    it('returns InvalidEmailException for missing @', () => {
      const result = Email.create('notanemail');
      expect(result.isErr).toBe(true);
      if (result.isErr)
        expect(result.error).toBeInstanceOf(InvalidEmailException);
    });

    it('returns InvalidEmailException for missing domain', () => {
      const result = Email.create('user@');
      expect(result.isErr).toBe(true);
    });

    it('returns InvalidEmailException for empty string', () => {
      const result = Email.create('');
      expect(result.isErr).toBe(true);
    });
  });

  describe('equals()', () => {
    it('two emails with same value are equal', () => {
      const a = Email.create('a@b.com');
      const b = Email.create('a@b.com');
      if (a.isOk && b.isOk) expect(a.value.equals(b.value)).toBe(true);
    });

    it('two emails with different values are not equal', () => {
      const a = Email.create('a@b.com');
      const b = Email.create('c@d.com');
      if (a.isOk && b.isOk) expect(a.value.equals(b.value)).toBe(false);
    });
  });
});
