import { Role } from '../../domain/role/role.entity';
import { Role as RoleEnum } from '../../domain/role/role.enum';
import { Permission } from '../../domain/permission/permissions';

export class RoleBuilder {
  private id: string = crypto.randomUUID();
  private name: string = RoleEnum.USER;
  private description: string | null = 'Standard User';
  private permissions: Permission[] = [];

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withName(name: RoleEnum): this {
    this.name = name;
    return this;
  }

  withPermissions(...permissions: Permission[]): this {
    this.permissions = permissions;
    return this;
  }

  withDescription(description: string | null): this {
    this.description = description;
    return this;
  }

  build(): Role {
    return Role.reconstitute(
      {
        name: this.name,
        description: this.description,
        permissions: this.permissions,
      },
      this.id,
      new Date(),
      new Date(),
    );
  }
}
