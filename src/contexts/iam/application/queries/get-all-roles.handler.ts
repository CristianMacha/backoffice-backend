import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAllRolesQuery } from './get-all-roles.query';
import {
  IRoleRepository,
  ROLE_REPOSITORY,
} from '../../domain/role/role.repository.interface';
import { Role } from '../../domain/role/role.entity';

@QueryHandler(GetAllRolesQuery)
export class GetAllRolesHandler implements IQueryHandler<
  GetAllRolesQuery,
  Role[]
> {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
  ) {}

  execute(_query: GetAllRolesQuery): Promise<Role[]> {
    return this.roleRepository.findAll();
  }
}
