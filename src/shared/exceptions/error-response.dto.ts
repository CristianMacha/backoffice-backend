import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponse {
  @ApiProperty({ example: 422 })
  statusCode: number;

  @ApiProperty({ example: 'CANNOT_DEACTIVATE_SELF' })
  errorCode: string;

  @ApiProperty({ example: 'A user cannot deactivate their own account' })
  message: string;

  @ApiProperty({
    example: 'ab70bbb1-7992-4e0a-aaa4-53ce1a4c31f2',
    nullable: true,
  })
  requestId: string | undefined;

  @ApiProperty({ example: '2026-05-28T21:21:50.635Z' })
  timestamp: string;

  @ApiProperty({
    example: '/api/v1/users/eb6c8c45-8ac9-4007-b55b-cfa52e819b7c',
  })
  path: string;
}
