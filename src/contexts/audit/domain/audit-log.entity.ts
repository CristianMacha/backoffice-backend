import { Entity } from '../../../shared/domain/entity.base';

export enum AuditAction {
  USER_CREATED = 'USER_CREATED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
}

interface AuditLogProps {
  entityType: string;
  entityId: string;
  action: AuditAction;
  payload: Record<string, unknown>;
  occurredAt: Date;
}

export class AuditLog extends Entity<string> {
  private _entityType: string;
  private _entityId: string;
  private _action: AuditAction;
  private _payload: Record<string, unknown>;
  private _occurredAt: Date;

  private constructor(props: AuditLogProps, id: string) {
    super(id, props.occurredAt, props.occurredAt);
    this._entityType = props.entityType;
    this._entityId = props.entityId;
    this._action = props.action;
    this._payload = { ...props.payload };
    this._occurredAt = props.occurredAt;
  }

  static create(props: AuditLogProps): AuditLog {
    return new AuditLog(props, crypto.randomUUID());
  }

  get entityType(): string {
    return this._entityType;
  }
  get entityId(): string {
    return this._entityId;
  }
  get action(): AuditAction {
    return this._action;
  }
  get payload(): Record<string, unknown> {
    return { ...this._payload };
  }
  get occurredAt(): Date {
    return this._occurredAt;
  }
}
