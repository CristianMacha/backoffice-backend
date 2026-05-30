import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../domain/user/user.aggregate';

export class UserResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  roleId: string;

  @ApiProperty({ example: 'active', enum: ['active', 'inactive', 'banned'] })
  status: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromDomain(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email.value;
    dto.roleId = user.roleId;
    dto.status = user.status;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}
