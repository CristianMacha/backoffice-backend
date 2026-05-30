import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { AuditLogOrmEntity } from './infrastructure/persistence/audit-log.orm-entity';
import { AuditLogRepository } from './infrastructure/persistence/audit-log.repository';
import { AUDIT_LOG_REPOSITORY } from './domain/audit-log.repository.interface';
import { UserCreatedAuditHandler } from './infrastructure/handlers/user-created-audit.handler';
import { UserRoleChangedAuditHandler } from './infrastructure/handlers/user-role-changed-audit.handler';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLogOrmEntity]), CqrsModule],
  providers: [
    { provide: AUDIT_LOG_REPOSITORY, useClass: AuditLogRepository },
    UserCreatedAuditHandler,
    UserRoleChangedAuditHandler,
  ],
})
export class AuditModule {}
