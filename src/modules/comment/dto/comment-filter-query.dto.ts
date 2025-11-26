import { PaginationQueryDto } from 'src/common/dto';
import { ISortQuery } from 'src/common/interfaces';
import { CommentSortKeys } from '../enums';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { SortOrder } from 'src/common/enums';

export class CommentFilterQueryDto
  extends PaginationQueryDto
  implements ISortQuery<CommentSortKeys>
{
  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter by recipe ID' })
  @IsOptional()
  @IsMongoId()
  recipeId?: string;

  @ApiPropertyOptional({
    description: 'Search in text body of the comments',
    example: 'I really like this recipe',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: CommentSortKeys,
    example: CommentSortKeys.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(CommentSortKeys)
  sortBy?: CommentSortKeys = CommentSortKeys.CREATED_AT;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;
}
