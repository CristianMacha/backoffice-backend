import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiArrayDataResponse,
  ApiDataResponse,
  ApiErrorResponses,
} from '../../../../shared/http/swagger/api-response.decorators';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { Permissions } from '../../domain/permission/permissions';
import { UpdateRolePermissionsDto } from '../dto/update-role-permissions.dto';
import { RoleResponseDto } from '../dto/role-response.dto';
import { PermissionResponseDto } from '../dto/permission-response.dto';
import { GetAllRolesQuery } from '../../application/queries/get-all-roles.query';
import { GetAllPermissionsQuery } from '../../application/queries/get-all-permissions.query';
import { UpdateRolePermissionsCommand } from '../../application/commands/update-role-permissions.command';
import { Role } from '../../domain/role/role.entity';
import { PermissionEntity } from '../../domain/permission/permission.entity';

@ApiTags('Roles')
@ApiBearerAuth('firebase-jwt')
@Controller('roles')
export class RolesController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  @RequirePermissions(Permissions.DASHBOARD.VIEW)
  @ApiOperation({ summary: 'List all roles with their permissions' })
  @ApiArrayDataResponse(RoleResponseDto)
  @ApiErrorResponses(401, 403)
  async findAll(): Promise<RoleResponseDto[]> {
    const roles = await this.queryBus.execute<GetAllRolesQuery, Role[]>(
      new GetAllRolesQuery(),
    );
    return roles.map((r) => RoleResponseDto.fromDomain(r));
  }

  @Get('permissions')
  @RequirePermissions(Permissions.DASHBOARD.VIEW)
  @ApiOperation({ summary: 'List all available permissions' })
  @ApiArrayDataResponse(PermissionResponseDto)
  @ApiErrorResponses(401, 403)
  async findAllPermissions(): Promise<PermissionResponseDto[]> {
    const permissions = await this.queryBus.execute<
      GetAllPermissionsQuery,
      PermissionEntity[]
    >(new GetAllPermissionsQuery());
    return permissions.map((r) => PermissionResponseDto.fromDomain(r));
  }

  @Patch(':id/permissions')
  @RequirePermissions(Permissions.ROLES.UPDATE)
  @ApiOperation({ summary: 'Replace permissions for a role' })
  @ApiDataResponse(RoleResponseDto)
  @ApiErrorResponses(400, 401, 403, 404)
  async updatePermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRolePermissionsDto,
  ): Promise<RoleResponseDto> {
    const role = await this.commandBus.execute<
      UpdateRolePermissionsCommand,
      Role
    >(new UpdateRolePermissionsCommand(id, dto.permissionIds));
    return RoleResponseDto.fromDomain(role);
  }
}
