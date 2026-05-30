import { Entity } from '../../../../shared/domain/entity.base';
import { Permission as PermissionEnum } from './permissions';

interface PermissionProps {
  name: PermissionEnum;
  description: string | null;
}

export class PermissionEntity extends Entity<string> {
  private _name: PermissionEnum;
  private _description: string | null;

  private constructor(
    props: PermissionProps,
    id: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
    this._name = props.name;
    this._description = props.description;
  }

  static create(props: PermissionProps): PermissionEntity {
    return new PermissionEntity(props, crypto.randomUUID());
  }

  static reconstitute(
    props: PermissionProps,
    id: string,
    createdAt: Date,
    updatedAt: Date,
  ): PermissionEntity {
    return new PermissionEntity(props, id, createdAt, updatedAt);
  }

  get name(): PermissionEnum {
    return this._name;
  }

  get description(): string | null {
    return this._description;
  }
}
