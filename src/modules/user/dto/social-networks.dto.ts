import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SocialNetworksDto {
  @ApiPropertyOptional({
    example: 'https://instagram.com/johndoe',
    description: 'Instagram profile URL',
  })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiPropertyOptional({
    example: 'https://youtube.com/@johndoe',
    description: 'YouTube channel URL',
  })
  @IsOptional()
  @IsString()
  youtube?: string;

  @ApiPropertyOptional({
    example: 'https://x.com/johndoe',
    description: 'X (formerly Twitter) profile URL',
  })
  @IsOptional()
  @IsString()
  x?: string;

  @ApiPropertyOptional({
    example: 'https://facebook.com/johndoe',
    description: 'Facebook profile URL',
  })
  @IsOptional()
  @IsString()
  facebook?: string;
}
