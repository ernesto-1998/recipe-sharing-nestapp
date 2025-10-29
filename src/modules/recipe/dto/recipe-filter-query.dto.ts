import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsEnum,
  IsMongoId,
  IsArray,
} from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { RecipeSortKeys } from '../enum/recipe-sort-keys.enum';
import { SortOrder } from 'src/common/enums/sort-order.enum';
import { ISortQuery } from 'src/common/interfaces';

export class RecipeFilterQueryDto
  extends PaginationQueryDto
  implements ISortQuery<RecipeSortKeys>
{
  @ApiPropertyOptional({
    description: 'Search in title and description',
    example: 'chocolate cake',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by author user ID' })
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Filter by ingredients (comma-separated)',
    example: 'tomato,cheese,basil',
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return Array.isArray(value) ? value : [];
  })
  ingredients?: string[];

  @ApiPropertyOptional({
    description: 'Filter by tags (comma-separated)',
    example: 'vegan,gluten-free,quick',
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return Array.isArray(value) ? value : [];
  })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Maximum preparation time (In Seconds)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  prepTimeLte?: number;

  @ApiPropertyOptional({ description: 'Minimum preparation time (In Seconds)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  prepTimeGte?: number;

  @ApiPropertyOptional({ description: 'Maximum number of portions (Integer)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  portionsLte?: number;

  @ApiPropertyOptional({ description: 'Minimum number of portions (Integer)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  portionsGte?: number;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: RecipeSortKeys,
    example: RecipeSortKeys.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(RecipeSortKeys)
  sortBy?: RecipeSortKeys = RecipeSortKeys.CREATED_AT;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;
}
