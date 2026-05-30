import { IRepository } from '../../../../shared/domain/repository.interface';
import { PaginationParams } from '../../../../shared/utils/pagination';
import { Permission } from '../permission/permissions';
import { User } from './user.aggregate';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface UserWithRole {
  user: User;
  roleName: string;
  permissions: Permission[];
}

export interface IUserRepository extends IRepository<User> {
  findByFirebaseUid(uid: string): Promise<User | null>;
  findByFirebaseUidWithRole(uid: string): Promise<UserWithRole | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(params: PaginationParams): Promise<{ users: User[]; total: number }>;
}
