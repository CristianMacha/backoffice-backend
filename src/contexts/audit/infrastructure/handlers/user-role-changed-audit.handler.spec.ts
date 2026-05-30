import { UserRoleChangedAuditHandler } from './user-role-changed-audit.handler';
import { UserRoleChangedEvent } from '@shared/domain/events/user-role-changed.event';
import { AuditLog, AuditAction } from '../../domain/audit-log.entity';
import { IAuditLogRepository } from '../../domain/audit-log.repository.interface';

describe('UserRoleChangedAuditHandler', () => {
  let handler: UserRoleChangedAuditHandler;
  let savedLog: AuditLog | null;
  let auditRepo: IAuditLogRepository;

  beforeEach(() => {
    savedLog = null;
    auditRepo = {
      save: jest.fn().mockImplementation((log: AuditLog) => {
        savedLog = log;
        return Promise.resolve();
      }),
    };
    handler = new UserRoleChangedAuditHandler(auditRepo);
  });

  it('creates an audit log for UserRoleChangedEvent', async () => {
    const event = new UserRoleChangedEvent('user-1', 'new-role', 'old-role');

    await handler.handle(event);

    expect(savedLog).not.toBeNull();
    expect(savedLog!.entityId).toBe('user-1');
    expect(savedLog!.entityType).toBe('User');
    expect(savedLog!.action).toBe(AuditAction.USER_ROLE_CHANGED);
    expect(savedLog!.payload).toMatchObject({
      newRoleId: 'new-role',
      previousRoleId: 'old-role',
    });
  });

  it('uses the event occurredAt as the log timestamp', async () => {
    const event = new UserRoleChangedEvent('user-1', 'new-role', 'old-role');

    await handler.handle(event);

    expect(savedLog!.occurredAt).toEqual(event.occurredAt);
  });
});
