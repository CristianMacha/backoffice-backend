import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UserCreatedEvent } from '@shared/domain/events/user-created.event';
import { AuditLog, AuditAction } from '../../domain/audit-log.entity';
import {
  IAuditLogRepository,
  AUDIT_LOG_REPOSITORY,
} from '../../domain/audit-log.repository.interface';

@EventsHandler(UserCreatedEvent)
export class UserCreatedAuditHandler implements IEventHandler<UserCreatedEvent> {
  constructor(
    @Inject(AUDIT_LOG_REPOSITORY)
    private readonly auditRepo: IAuditLogRepository,
  ) {}

  async handle(event: UserCreatedEvent): Promise<void> {
    const log = AuditLog.create({
      entityType: 'User',
      entityId: event.userId,
      action: AuditAction.USER_CREATED,
      payload: {
        firebaseUid: event.firebaseUid,
        email: event.email,
        roleId: event.roleId,
      },
      occurredAt: event.occurredAt,
    });

    await this.auditRepo.save(log);
  }
}
