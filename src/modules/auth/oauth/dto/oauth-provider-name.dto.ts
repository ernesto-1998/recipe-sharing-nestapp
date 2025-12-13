import { IsEnum } from 'class-validator';
import { OAuthProviderName } from '../enums';
import { ApiProperty } from '@nestjs/swagger';

export class OAuthProviderNameDto {
  @ApiProperty({
    description: 'OAuth provider to use for authentication.',
    enum: OAuthProviderName,
    example: OAuthProviderName.GOOGLE,
  })
  @IsEnum(OAuthProviderName)
  provider: OAuthProviderName;
}
