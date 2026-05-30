import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../domain/audit-log.entity';
import { IAuditLogRepository } from '../../domain/audit-log.repository.interface';
import { AuditLogOrmEntity } from './audit-log.orm-entity';

@Injectable()
export class AuditLogRepository implements IAuditLogRepository {
  constructor(
    @InjectRepository(AuditLogOrmEntity)
    private readonly repo: Repository<AuditLogOrmEntity>,
  ) {}

  async save(log: AuditLog): Promise<void> {
    const entity = new AuditLogOrmEntity();
    entity.id = log.id;
    entity.entityType = log.entityType;
    entity.entityId = log.entityId;
    entity.action = log.action;
    entity.payload = log.payload;
    entity.occurredAt = log.occurredAt;
    await this.repo.save(entity);
  }
}
