import { UserCreatedAuditHandler } from './user-created-audit.handler';
import { UserCreatedEvent } from '@shared/domain/events/user-created.event';
import { AuditLog, AuditAction } from '../../domain/audit-log.entity';
import { IAuditLogRepository } from '../../domain/audit-log.repository.interface';

describe('UserCreatedAuditHandler', () => {
  let handler: UserCreatedAuditHandler;
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
    handler = new UserCreatedAuditHandler(auditRepo);
  });

  it('creates an audit log for UserCreatedEvent', async () => {
    const event = new UserCreatedEvent(
      'user-1',
      'firebase-uid',
      'a@b.com',
      'role-1',
    );

    await handler.handle(event);

    expect(savedLog).not.toBeNull();
    expect(savedLog!.entityId).toBe('user-1');
    expect(savedLog!.entityType).toBe('User');
    expect(savedLog!.action).toBe(AuditAction.USER_CREATED);
    expect(savedLog!.payload).toMatchObject({
      firebaseUid: 'firebase-uid',
      email: 'a@b.com',
      roleId: 'role-1',
    });
  });

  it('uses the event occurredAt as the log timestamp', async () => {
    const event = new UserCreatedEvent(
      'user-1',
      'firebase-uid',
      'a@b.com',
      'role-1',
    );

    await handler.handle(event);

    expect(savedLog!.occurredAt).toEqual(event.occurredAt);
  });
});
