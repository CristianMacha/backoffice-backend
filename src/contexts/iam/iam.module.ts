import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { RoleOrmEntity } from './infrastructure/persistence/role.orm-entity';
import { UserOrmEntity } from './infrastructure/persistence/user.orm-entity';
import { PermissionOrmEntity } from './infrastructure/persistence/permission.orm-entity';
import { RoleRepository } from './infrastructure/persistence/role.repository';
import { UserRepository } from './infrastructure/persistence/user.repository';
import { PermissionRepository } from './infrastructure/persistence/permission.repository';
import { FirebaseAdminProvider } from './infrastructure/firebase/firebase-admin.provider';
import { FirebaseAuthService } from './infrastructure/firebase/firebase-auth.service';
import { ROLE_REPOSITORY } from './domain/role/role.repository.interface';
import { USER_REPOSITORY } from './domain/user/user.repository.interface';
import { PERMISSION_REPOSITORY } from './domain/permission/permission.repository.interface';
import { UpdateRolePermissionsHandler } from './application/commands/update-role-permissions.handler';
import { GetAllRolesHandler } from './application/queries/get-all-roles.handler';
import { GetAllPermissionsHandler } from './application/queries/get-all-permissions.handler';
import { CreateUserHandler } from './application/commands/create-user.handler';
import { ChangeUserRoleHandler } from './application/commands/change-user-role.handler';
import { DeactivateUserHandler } from './application/commands/deactivate-user.handler';
import { LogoutHandler } from './application/commands/logout.handler';
import { SendPasswordResetHandler } from './application/commands/send-password-reset.handler';
import { GetUserByFirebaseUidHandler } from './application/queries/get-user-by-firebase-uid.handler';
import { GetUserByIdHandler } from './application/queries/get-user-by-id.handler';
import { GetUsersHandler } from './application/queries/get-users.handler';
import { UsersController } from './interface/controllers/users.controller';
import { RolesController } from './interface/controllers/roles.controller';
import { AuthController } from './interface/controllers/auth.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoleOrmEntity,
      UserOrmEntity,
      PermissionOrmEntity,
    ]),
    CqrsModule,
  ],
  providers: [
    { provide: ROLE_REPOSITORY, useClass: RoleRepository },
    { provide: USER_REPOSITORY, useClass: UserRepository },
    { provide: PERMISSION_REPOSITORY, useClass: PermissionRepository },
    FirebaseAdminProvider,
    FirebaseAuthService,
    UpdateRolePermissionsHandler,
    GetAllRolesHandler,
    GetAllPermissionsHandler,
    CreateUserHandler,
    ChangeUserRoleHandler,
    DeactivateUserHandler,
    LogoutHandler,
    SendPasswordResetHandler,
    GetUserByFirebaseUidHandler,
    GetUserByIdHandler,
    GetUsersHandler,
  ],
  controllers: [UsersController, RolesController, AuthController],
  exports: [USER_REPOSITORY, FirebaseAuthService],
})
export class IamModule {}
