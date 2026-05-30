import { IRepository } from '../../../../shared/domain/repository.interface';
import { PermissionEntity } from './permission.entity';

export const PERMISSION_REPOSITORY = 'PERMISSION_REPOSITORY';

export interface IPermissionRepository extends IRepository<PermissionEntity> {
  findByIds(ids: string[]): Promise<PermissionEntity[]>;
  findAll(): Promise<PermissionEntity[]>;
}
