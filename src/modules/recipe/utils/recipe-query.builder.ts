import { RecipeFilterQueryDto } from '../dto/recipe-filter-query.dto';
import { PrivacyLevel, SortOrder } from 'src/common/enums';
import { RecipeSortKeys } from '../enum';
import { RecipeFilterObject, RecipeSortObject } from '../types';

export const buildRecipeFilter = (
  filters: RecipeFilterQueryDto,
): RecipeFilterObject => {
  const {
    search,
    userId,
    category,
    ingredients,
    tags,
    prepTimeLte,
    prepTimeGte,
    portionsLte,
    portionsGte,
  } = filters;

  const filter: RecipeFilterObject = {};

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  if (userId) filter.userId = userId;
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

  filter.privacy = PrivacyLevel.PUBLIC;

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
