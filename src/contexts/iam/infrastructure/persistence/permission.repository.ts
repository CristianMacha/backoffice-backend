import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PermissionEntity } from '../../domain/permission/permission.entity';
import { IPermissionRepository } from '../../domain/permission/permission.repository.interface';
import { Permission as PermissionEnum } from '../../domain/permission/permissions';
import { PermissionOrmEntity } from './permission.orm-entity';
import { TypeOrmRepositoryBase } from '../../../../shared/infrastructure/typeorm-repository.base';

@Injectable()
export class PermissionRepository
  extends TypeOrmRepositoryBase<PermissionOrmEntity, PermissionEntity>
  implements IPermissionRepository
{
  constructor(
    @InjectRepository(PermissionOrmEntity)
    repo: Repository<PermissionOrmEntity>,
  ) {
    super(repo);
  }

  async findByIds(ids: string[]): Promise<PermissionEntity[]> {
    if (ids.length === 0) return [];
    const entities = await this.repo.find({ where: { id: In(ids) } });
    return entities.map((e) => this.toDomain(e));
  }

  async findAll(): Promise<PermissionEntity[]> {
    const entities = await this.repo.find();
    return entities.map((e) => this.toDomain(e));
  }

  toDomain(entity: PermissionOrmEntity): PermissionEntity {
    return PermissionEntity.reconstitute(
      { name: entity.name as PermissionEnum, description: entity.description },
      entity.id,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  toOrm(permission: PermissionEntity): PermissionOrmEntity {
    const entity = new PermissionOrmEntity();
    entity.id = permission.id;
    entity.name = permission.name;
    entity.description = permission.description;
    return entity;
  }
}
