import { ApiProperty } from '@nestjs/swagger';
import { AuthUser } from '../types/auth-user.type';

export class MeResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'admin' })
  role: string;

  @ApiProperty({ example: 'active', enum: ['active', 'inactive', 'banned'] })
  status: string;

  @ApiProperty({ example: ['users.read', 'products.read'], type: [String] })
  permissions: string[];

  static fromAuthUser(authUser: AuthUser): MeResponseDto {
    const dto = new MeResponseDto();
    dto.id = authUser.userId;
    dto.email = authUser.email ?? '';
    dto.role = authUser.role;
    dto.status = authUser.status;
    dto.permissions = authUser.permissions;
    return dto;
  }
}
