import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PermissionEntity } from '../../domain/permission/permission.entity';

export class PermissionResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'users:read' })
  name: string;

  @ApiPropertyOptional({ example: 'View users', nullable: true })
  description: string | null;

  static fromDomain(permission: PermissionEntity): PermissionResponseDto {
    const dto = new PermissionResponseDto();
    dto.id = permission.id;
    dto.name = permission.name;
    dto.description = permission.description;
    return dto;
  }
}
