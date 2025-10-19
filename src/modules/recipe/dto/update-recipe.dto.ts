import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateRecipeDto } from './create-recipe.dto';

export class UpdateRecipeDtoOmitted extends OmitType(CreateRecipeDto, [
  'authorId',
] as const) {}

export class UpdateRecipeDto extends PartialType(UpdateRecipeDtoOmitted) {}
