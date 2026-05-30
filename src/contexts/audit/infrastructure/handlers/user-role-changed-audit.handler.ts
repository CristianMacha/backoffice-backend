import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UserRoleChangedEvent } from '@shared/domain/events/user-role-changed.event';
import { AuditLog, AuditAction } from '../../domain/audit-log.entity';
import {
  IAuditLogRepository,
  AUDIT_LOG_REPOSITORY,
} from '../../domain/audit-log.repository.interface';

@EventsHandler(UserRoleChangedEvent)
export class UserRoleChangedAuditHandler implements IEventHandler<UserRoleChangedEvent> {
  constructor(
    @Inject(AUDIT_LOG_REPOSITORY)
    private readonly auditRepo: IAuditLogRepository,
  ) {}

  async handle(event: UserRoleChangedEvent): Promise<void> {
    const log = AuditLog.create({
      entityType: 'User',
      entityId: event.userId,
      action: AuditAction.USER_ROLE_CHANGED,
      payload: {
        newRoleId: event.newRoleId,
        previousRoleId: event.previousRoleId,
      },
      occurredAt: event.occurredAt,
    });

    await this.auditRepo.save(log);
  }
}
