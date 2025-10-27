import { FilterQuery } from 'mongoose';
import { RecipeDocument } from '../schemas/recipe.schema';

export type RecipeFilterObject = FilterQuery<RecipeDocument>;
