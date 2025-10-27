import { OmitType } from '@nestjs/swagger';
import { RecipeDto } from './recipe.dto';

export class CreateRecipeDto extends OmitType(RecipeDto, [
  '_id',
  'userId',
  'createdAt',
  'updatedAt',
  '__v',
] as const) {}
