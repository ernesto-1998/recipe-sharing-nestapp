import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AddressDto {
  @ApiPropertyOptional({
    example: 'United States',
    description: 'Country of the user address',
  })
  @IsOptional()
  @IsString()
  country?: string;
}
