import { RecipeFilterQueryDto } from '../dto/recipe-filter-query.dto';
import { PrivacyLevel, SortOrder } from 'src/common/enums';
import { RecipeSortKeys } from '../enums';
import { RecipeFilterObject, RecipeSortObject } from '../types';
import { MyRecipesFilterQueryDto } from '../dto';

export const buildRecipeFilter = (
  filters: RecipeFilterQueryDto | MyRecipesFilterQueryDto,
): RecipeFilterObject => {
  const {
    search,
    category,
    ingredients,
    tags,
    prepTimeLte,
    prepTimeGte,
    portionsLte,
    portionsGte,
  } = filters;

  const userId = 'userId' in filters ? filters.userId : undefined;
  const privacy = 'privacy' in filters ? filters.privacy : undefined;

  const filter: RecipeFilterObject = {};

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  if (userId !== undefined) filter.userId = userId;
  if (category) filter.category = category;

  if (ingredients?.length) filter['ingredients.name'] = { $all: ingredients };
  if (tags?.length) filter.tags = { $all: tags };

  if (prepTimeLte || prepTimeGte) {
    filter.prepTime = {};
    if (prepTimeGte) filter.prepTime.$gte = prepTimeGte;
    if (prepTimeLte) filter.prepTime.$lte = prepTimeLte;
  }

  if (portionsLte || portionsGte) {
    filter.portions = {};
    if (portionsGte) filter.portions.$gte = portionsGte;
    if (portionsLte) filter.portions.$lte = portionsLte;
  }

  if (privacy !== undefined) {
    filter.privacy = privacy;
  }

  return filter;
};

export const buildRecipeSort = (
  filters: RecipeFilterQueryDto,
): RecipeSortObject => {
  const { sortBy, order } = filters;

  return {
    [sortBy || RecipeSortKeys.CREATED_AT]: order === SortOrder.ASC ? 1 : -1,
  };
};
