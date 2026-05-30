import { IRepository } from '../../../../shared/domain/repository.interface';
import { Role } from './role.entity';

export const ROLE_REPOSITORY = 'ROLE_REPOSITORY';

export interface IRoleRepository extends IRepository<Role> {
  findByName(name: string): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  replacePermissions(roleId: string, permissionIds: string[]): Promise<void>;
}
