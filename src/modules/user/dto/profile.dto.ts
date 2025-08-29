import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AddressDto } from './address.dto';
import { SocialNetworksDto } from './social-networks.dto';

export class ProfileDto {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'Software engineer with 5 years of experience',
    description: 'Users biograhpy',
  })
  @IsOptional()
  @IsString()
  biography?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/profile.jpg',
    description: 'Profile users photo',
  })
  @IsOptional()
  @IsString()
  profilePic?: string;

  @ApiPropertyOptional({
    type: () => SocialNetworksDto,
    description: 'Social networks of the user',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialNetworksDto)
  social_networks?: SocialNetworksDto;

  @ApiPropertyOptional({
    type: () => AddressDto,
    description: 'Users Address',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}
