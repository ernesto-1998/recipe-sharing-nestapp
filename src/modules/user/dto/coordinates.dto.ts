import { IsOptional, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CoordinatesDto {
  @ApiPropertyOptional({
    example: 40.7128,
    description: 'Latitude of the location',
  })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({
    example: -74.006,
    description: 'Longitude of the location',
  })
  @IsOptional()
  @IsNumber()
  lng?: number;
}
