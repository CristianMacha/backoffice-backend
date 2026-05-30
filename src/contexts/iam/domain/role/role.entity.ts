import { Entity } from '../../../../shared/domain/entity.base';
import { Permission } from '../permission/permissions';

interface RoleProps {
  name: string;
  description: string | null;
  permissions: Permission[];
}

export class Role extends Entity<string> {
  private _name: string;
  private _description: string | null;
  private _permissions: Permission[];

  private constructor(
    props: RoleProps,
    id: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
    this._name = props.name;
    this._description = props.description;
    this._permissions = [...props.permissions];
  }

  static create(props: RoleProps): Role {
    return new Role(props, crypto.randomUUID());
  }

  static reconstitute(
    props: RoleProps,
    id: string,
    createdAt: Date,
    updatedAt: Date,
  ): Role {
    return new Role(props, id, createdAt, updatedAt);
  }

  replacePermissions(permissions: Permission[]): void {
    this._permissions = [...permissions];
    this._updatedAt = new Date();
  }

  get name(): string {
    return this._name;
  }

  get description(): string | null {
    return this._description;
  }

  get permissions(): Permission[] {
    return [...this._permissions];
  }
}
