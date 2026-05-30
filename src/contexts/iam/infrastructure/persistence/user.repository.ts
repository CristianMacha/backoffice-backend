import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/user/user.aggregate';
import {
  IUserRepository,
  UserWithRole,
} from '../../domain/user/user.repository.interface';
import { Email } from '../../domain/user/email.value-object';
import { UserStatus } from '../../domain/user/user-status.enum';
import { Permission } from '../../domain/permission/permissions';
import { RoleNotFoundException } from '../../domain/exceptions/role-not-found.exception';
import { UserOrmEntity } from './user.orm-entity';
import { TypeOrmRepositoryBase } from '../../../../shared/infrastructure/typeorm-repository.base';
import { PaginationParams } from '../../../../shared/utils/pagination';

@Injectable()
export class UserRepository
  extends TypeOrmRepositoryBase<UserOrmEntity, User>
  implements IUserRepository
{
  constructor(
    @InjectRepository(UserOrmEntity)
    repo: Repository<UserOrmEntity>,
  ) {
    super(repo);
  }

  async findByFirebaseUid(uid: string): Promise<User | null> {
    const entity = await this.repo.findOne({ where: { firebaseUid: uid } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByFirebaseUidWithRole(uid: string): Promise<UserWithRole | null> {
    const entity = await this.repo.findOne({
      where: { firebaseUid: uid },
      relations: { role: { permissions: true } },
    });
    if (!entity) return null;
    if (!entity.role) throw new RoleNotFoundException(entity.roleId);

    return {
      user: this.toDomain(entity),
      roleName: entity.role.name,
      permissions: entity.role.permissions.map((p) => p.name as Permission),
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repo.findOne({ where: { email } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(
    params: PaginationParams,
  ): Promise<{ users: User[]; total: number }> {
    const [entities, total] = await this.repo.findAndCount({
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      order: { createdAt: 'DESC' },
    });
    return { users: entities.map((e) => this.toDomain(e)), total };
  }

  toDomain(entity: UserOrmEntity): User {
    const emailResult = Email.create(entity.email);
    if (emailResult.isErr)
      throw new Error(`Corrupted email in DB: ${entity.email}`);

    return User.reconstitute(
      {
        firebaseUid: entity.firebaseUid,
        email: emailResult.value,
        roleId: entity.roleId,
        status: entity.status as UserStatus,
      },
      entity.id,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  toOrm(user: User): UserOrmEntity {
    const entity = new UserOrmEntity();
    entity.id = user.id;
    entity.firebaseUid = user.firebaseUid;
    entity.email = user.email.value;
    entity.roleId = user.roleId;
    entity.status = user.status;
    return entity;
  }
}
