import { AuditLog } from './audit-log.entity';

export const AUDIT_LOG_REPOSITORY = 'AUDIT_LOG_REPOSITORY';

export interface IAuditLogRepository {
  save(log: AuditLog): Promise<void>;
}
