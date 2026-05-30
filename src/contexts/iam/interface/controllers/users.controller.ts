import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiDataResponse,
  ApiErrorResponses,
  ApiPaginatedResponse,
} from '../../../../shared/http/swagger/api-response.decorators';
import { Throttle } from '@nestjs/throttler';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { Permissions } from '../../domain/permission/permissions';
import { CreateUserDto } from '../dto/create-user.dto';
import { ChangeUserRoleDto } from '../dto/change-user-role.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { CreateUserCommand } from '../../application/commands/create-user.command';
import { ChangeUserRoleCommand } from '../../application/commands/change-user-role.command';
import { DeactivateUserCommand } from '../../application/commands/deactivate-user.command';
import { SendPasswordResetCommand } from '../../application/commands/send-password-reset.command';
import { PasswordResetResult } from '../../application/commands/send-password-reset.handler';
import { GetUserByIdQuery } from '../../application/queries/get-user-by-id.query';
import { GetUsersQuery } from '../../application/queries/get-users.query';
import { User } from '../../domain/user/user.aggregate';
import { PasswordResetResponseDto } from '../dto/password-reset-response.dto';
import { PaginatedResult } from '../../../../shared/utils/pagination';
import { AuthUserDecorator } from '../decorators/auth-user.decorator';
import { AuthUser } from '../types/auth-user.type';

@ApiTags('Users')
@ApiBearerAuth('firebase-jwt')
@Controller('users')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ strict: { ttl: 60_000, limit: 10 } })
  @RequirePermissions(Permissions.USERS.CREATE)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiDataResponse(UserResponseDto, HttpStatus.CREATED)
  @ApiErrorResponses(400, 401, 403, 409, 429)
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.commandBus.execute<CreateUserCommand, User>(
      new CreateUserCommand(dto.email, dto.roleId),
    );
    return UserResponseDto.fromDomain(user);
  }

  @Get()
  @RequirePermissions(Permissions.USERS.READ)
  @ApiOperation({ summary: 'List users (paginated)' })
  @ApiPaginatedResponse(UserResponseDto)
  @ApiErrorResponses(401, 403)
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResult<UserResponseDto>> {
    const result = await this.queryBus.execute<
      GetUsersQuery,
      PaginatedResult<User>
    >(new GetUsersQuery({ page: query.page, limit: query.limit }));
    return {
      data: result.data.map((d) => UserResponseDto.fromDomain(d)),
      meta: result.meta,
    };
  }

  @Get(':id')
  @RequirePermissions(Permissions.USERS.READ)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiDataResponse(UserResponseDto)
  @ApiErrorResponses(401, 403, 404)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    const user = await this.queryBus.execute<GetUserByIdQuery, User>(
      new GetUserByIdQuery(id),
    );
    return UserResponseDto.fromDomain(user);
  }

  @Patch(':id/role')
  @RequirePermissions(Permissions.USERS.UPDATE)
  @ApiOperation({ summary: 'Change user role' })
  @ApiDataResponse(UserResponseDto)
  @ApiErrorResponses(401, 403, 404, 422)
  async changeRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeUserRoleDto,
    @AuthUserDecorator() requester: AuthUser,
  ): Promise<UserResponseDto> {
    const user = await this.commandBus.execute<ChangeUserRoleCommand, User>(
      new ChangeUserRoleCommand(id, dto.roleId, requester.userId),
    );
    return UserResponseDto.fromDomain(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ strict: { ttl: 60_000, limit: 10 } })
  @RequirePermissions(Permissions.USERS.DELETE)
  @ApiOperation({ summary: 'Deactivate a user' })
  @ApiResponse({ status: 204, description: 'User deactivated' })
  @ApiErrorResponses(401, 403, 404, 422)
  async deactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUserDecorator() requester: AuthUser,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeactivateUserCommand(id, requester.userId),
    );
  }

  @Post(':id/password-reset')
  @HttpCode(HttpStatus.OK)
  @Throttle({ strict: { ttl: 60_000, limit: 10 } })
  @RequirePermissions(Permissions.USERS.UPDATE)
  @ApiOperation({ summary: 'Send password reset link to a user' })
  @ApiDataResponse(PasswordResetResponseDto)
  @ApiErrorResponses(401, 403, 404)
  async sendPasswordReset(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PasswordResetResponseDto> {
    return this.commandBus.execute<
      SendPasswordResetCommand,
      PasswordResetResult
    >(new SendPasswordResetCommand(id));
  }
}
