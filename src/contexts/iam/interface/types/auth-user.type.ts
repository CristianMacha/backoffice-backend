import { Permission } from '../../domain/permission/permissions';
import { Role } from '../../domain/role/role.enum';
import { UserStatus } from '../../domain/user/user-status.enum';

export interface AuthUser {
  uid: string;
  email: string | undefined;
  role: Role;
  userId: string;
  roleId: string;
  status: UserStatus;
  permissions: Permission[];
}
