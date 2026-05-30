import { Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiDataResponse,
  ApiErrorResponses,
} from '../../../../shared/http/swagger/api-response.decorators';
import { CommandBus } from '@nestjs/cqrs';
import { Throttle } from '@nestjs/throttler';
import { AuthUserDecorator } from '../decorators/auth-user.decorator';
import { AuthUser } from '../types/auth-user.type';
import { LogoutCommand } from '../../application/commands/logout.command';
import { MeResponseDto } from '../dto/me-response.dto';

@ApiTags('Auth')
@ApiBearerAuth('firebase-jwt')
@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user with permissions' })
  @ApiDataResponse(MeResponseDto)
  @ApiErrorResponses(401)
  me(@AuthUserDecorator() user: AuthUser): MeResponseDto {
    return MeResponseDto.fromAuthUser(user);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ strict: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: 'Revoke current session tokens' })
  @ApiResponse({ status: 204, description: 'Logged out successfully' })
  @ApiErrorResponses(401)
  async logout(@AuthUserDecorator() user: AuthUser): Promise<void> {
    await this.commandBus.execute(new LogoutCommand(user.uid));
  }
}
