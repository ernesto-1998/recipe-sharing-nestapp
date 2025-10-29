import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { RecipeFilterQueryDto } from './recipe-filter-query.dto';
import { PrivacyLevel } from 'src/common/enums';

export class MyRecipesFilterQueryDto extends OmitType(RecipeFilterQueryDto, [
  'userId',
] as const) {
  @ApiPropertyOptional({
    description: 'Filter by privacy level',
    enum: PrivacyLevel,
    example: PrivacyLevel.PUBLIC,
  })
  @IsOptional()
  @IsEnum(PrivacyLevel)
  privacy?: PrivacyLevel;
}
