import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAllPermissionsQuery } from './get-all-permissions.query';
import {
  IPermissionRepository,
  PERMISSION_REPOSITORY,
} from '../../domain/permission/permission.repository.interface';
import { PermissionEntity } from '../../domain/permission/permission.entity';

@QueryHandler(GetAllPermissionsQuery)
export class GetAllPermissionsHandler implements IQueryHandler<
  GetAllPermissionsQuery,
  PermissionEntity[]
> {
  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  execute(_query: GetAllPermissionsQuery): Promise<PermissionEntity[]> {
    return this.permissionRepository.findAll();
  }
}
