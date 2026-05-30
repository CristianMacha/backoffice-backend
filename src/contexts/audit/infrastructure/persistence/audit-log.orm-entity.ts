import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLogOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'entity_type', type: 'varchar', length: 100 })
  entityType: string;

  @Index()
  @Column({ name: 'entity_id', type: 'uuid' })
  entityId: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @Index()
  @CreateDateColumn({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt: Date;
}
