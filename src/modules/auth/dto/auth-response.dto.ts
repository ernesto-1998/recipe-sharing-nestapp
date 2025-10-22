import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token for authentication.',
  })
  accessToken: string;

  @ApiProperty({
    example: '64c9b2f3e8a1a2b4c56789de',
    description: 'Unique identifier of the authenticated user.',
  })
  userId: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'Username of the authenticated user.',
  })
  username: string;
}
