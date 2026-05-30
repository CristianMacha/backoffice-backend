import { ConflictDomainException } from './conflict.exception';

// PostgreSQL error codes
const PG_UNIQUE_VIOLATION = '23505';
const PG_FK_VIOLATION = '23503';

interface DbError {
  code?: string;
  detail?: string;
}

export class DatabaseConflictException extends ConflictDomainException {
  readonly errorCode = 'DATABASE_CONFLICT';
}

export class DatabaseForeignKeyException extends ConflictDomainException {
  readonly errorCode = 'INVALID_REFERENCE';
}

export function handleTypeOrmError(error: unknown): never {
  const dbError = error as DbError;

  if (dbError?.code === PG_UNIQUE_VIOLATION) {
    throw new DatabaseConflictException('Resource already exists');
  }

  if (dbError?.code === PG_FK_VIOLATION) {
    throw new DatabaseForeignKeyException('Referenced resource does not exist');
  }

  throw error;
}
