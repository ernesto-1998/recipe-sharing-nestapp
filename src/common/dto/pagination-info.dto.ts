import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class PaginationInfoDto {
  @ApiProperty({
    example: 150,
    description: 'Total number of items available across all pages.',
  })
  @IsInt()
  count: number;

  @ApiProperty({
    example: 15,
    description: 'Total number of pages based on the current limit.',
  })
  @IsInt()
  pages: number;

  @ApiProperty({
    example: 'https://api.recipes.com/recipes?page=3',
    description:
      'URL to fetch the next page of results, or null if on the last page.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  next: string | null;

  @ApiProperty({
    example: 'https://api.recipes.com/recipes?page=1',
    description:
      'URL to fetch the previous page of results, or null if on the first page.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  prev: string | null;
}
