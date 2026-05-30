import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from '../../domain/role/role.entity';
import { IRoleRepository } from '../../domain/role/role.repository.interface';
import { Permission } from '../../domain/permission/permissions';
import { RoleOrmEntity } from './role.orm-entity';
import { PermissionOrmEntity } from './permission.orm-entity';
import { TypeOrmRepositoryBase } from '../../../../shared/infrastructure/typeorm-repository.base';

@Injectable()
export class RoleRepository
  extends TypeOrmRepositoryBase<RoleOrmEntity, Role>
  implements IRoleRepository
{
  constructor(
    @InjectRepository(RoleOrmEntity)
    repo: Repository<RoleOrmEntity>,
    @InjectRepository(PermissionOrmEntity)
    private readonly permissionRepo: Repository<PermissionOrmEntity>,
  ) {
    super(repo);
  }

  async findById(id: string): Promise<Role | null> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: { permissions: true },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const entity = await this.repo.findOne({
      where: { name },
      relations: { permissions: true },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<Role[]> {
    const entities = await this.repo.find({
      relations: { permissions: true },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async replacePermissions(
    roleId: string,
    permissionIds: string[],
  ): Promise<void> {
    const permissions =
      permissionIds.length > 0
        ? await this.permissionRepo.find({ where: { id: In(permissionIds) } })
        : [];
    await this.repo.save({ id: roleId, permissions });
  }

  toDomain(entity: RoleOrmEntity): Role {
    const permissions = (entity.permissions ?? []).map(
      (p) => p.name as Permission,
    );
    return Role.reconstitute(
      { name: entity.name, description: entity.description, permissions },
      entity.id,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  toOrm(role: Role): RoleOrmEntity {
    const entity = new RoleOrmEntity();
    entity.id = role.id;
    entity.name = role.name;
    entity.description = role.description;
    return entity;
  }
}
