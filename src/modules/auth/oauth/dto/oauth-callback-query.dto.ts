import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class OAuthCallbackQueryDto {
  @ApiProperty({
    description: 'Authorization code returned by the OAuth provider.',
    example: '4/0AbCDeFgHiJkLmNoPqRsTuVwXyZ123456789',
    required: false,
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({
    description: 'Error message returned by the OAuth provider, if any.',
    example: 'access_denied',
    required: false,
  })
  @IsString()
  @IsOptional()
  error?: string;
}
