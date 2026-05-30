import { PermissionEntity } from '../../domain/permission/permission.entity';
import { Permission, Permissions } from '../../domain/permission/permissions';

export class PermissionBuilder {
  private id: string = crypto.randomUUID();
  private name: Permission = Permissions.USERS.READ;
  private description: string | null = null;

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withName(name: Permission): this {
    this.name = name;
    return this;
  }

  withDescription(description: string | null): this {
    this.description = description;
    return this;
  }

  build(): PermissionEntity {
    return PermissionEntity.reconstitute(
      { name: this.name, description: this.description },
      this.id,
      new Date(),
      new Date(),
    );
  }
}
