import { buildRecipeFilter, buildRecipeSort } from './recipe-query.builder';
import { PrivacyLevel, SortOrder } from 'src/common/enums';
import { RecipeSortKeys } from '../enums';
import { MyRecipesFilterQueryDto, RecipeFilterQueryDto } from '../dto';

const baseFilters = {
  page: 1,
  limit: 10,
  sortBy: RecipeSortKeys.CREATED_AT,
  order: SortOrder.DESC,
};

describe('recipe-query.builder', () => {
  describe('buildRecipeFilter', () => {
    it('should return empty filter when no filters provided', () => {
      const result = buildRecipeFilter({} as RecipeFilterQueryDto);
      expect(result).toEqual({});
    });

    it('should build search filter with title and description regex', () => {
      const result = buildRecipeFilter({
        search: 'pizza',
      } as RecipeFilterQueryDto);

      expect(result.$or).toEqual([
        { title: { $regex: 'pizza', $options: 'i' } },
        { description: { $regex: 'pizza', $options: 'i' } },
      ]);
    });

    it('should include category filter when provided', () => {
      const result = buildRecipeFilter({
        category: 'Dinner',
      } as RecipeFilterQueryDto);
      expect(result.category).toBe('Dinner');
    });

    it('should include ingredients filter using $all', () => {
      const result = buildRecipeFilter({
        ingredients: ['tomato', 'cheese'],
      } as any);

      expect(result['ingredients.name']).toEqual({
        $all: ['tomato', 'cheese'],
      });
    });

    it('should include tags filter using $all', () => {
      const result = buildRecipeFilter({
        tags: ['vegan', 'quick'],
      } as RecipeFilterQueryDto);

      expect(result.tags).toEqual({
        $all: ['vegan', 'quick'],
      });
    });

    it('should include prepTime range with $gte and $lte', () => {
      const result = buildRecipeFilter({
        prepTimeGte: 10,
        prepTimeLte: 30,
      } as any);

      expect(result.prepTime).toEqual({
        $gte: 10,
        $lte: 30,
      });
    });

    it('should include only $gte for prepTime', () => {
      const result = buildRecipeFilter({
        prepTimeGte: 15,
      } as RecipeFilterQueryDto);

      expect(result.prepTime).toEqual({ $gte: 15 });
    });

    it('should include only $lte for prepTime', () => {
      const result = buildRecipeFilter({
        prepTimeLte: 20,
      } as RecipeFilterQueryDto);

      expect(result.prepTime).toEqual({ $lte: 20 });
    });

    it('should include portions range', () => {
      const result = buildRecipeFilter({
        portionsGte: 2,
        portionsLte: 4,
      } as any);

      expect(result.portions).toEqual({
        $gte: 2,
        $lte: 4,
      });
    });

    it('should include only $gte for portions', () => {
      const result = buildRecipeFilter({
        portionsGte: 3,
      } as RecipeFilterQueryDto);

      expect(result.portions).toEqual({ $gte: 3 });
    });

    it('should include only $lte for portions', () => {
      const result = buildRecipeFilter({
        portionsLte: 6,
      } as RecipeFilterQueryDto);

      expect(result.portions).toEqual({ $lte: 6 });
    });

    it('should include userId only when coming from MyRecipesFilterQueryDto', () => {
      const result = buildRecipeFilter({
        userId: 'user123',
      } as RecipeFilterQueryDto);

      expect(result.userId).toBe('user123');
    });

    it('should include privacy only when present in MyRecipesFilterQueryDto', () => {
      const result = buildRecipeFilter({
        privacy: PrivacyLevel.PUBLIC,
      } as MyRecipesFilterQueryDto);

      expect(result.privacy).toBe(PrivacyLevel.PUBLIC);
    });

    it('should build full complex filter', () => {
      const result = buildRecipeFilter({
        search: 'soup',
        category: 'Lunch',
        ingredients: ['water', 'salt'],
        tags: ['easy'],
        prepTimeGte: 5,
        prepTimeLte: 20,
        portionsGte: 1,
        portionsLte: 3,
        userId: 'abc123',
        privacy: PrivacyLevel.PRIVATE,
        page: 1,
        limit: 10,
      } as MyRecipesFilterQueryDto);

      expect(result).toEqual({
        $or: [
          { title: { $regex: 'soup', $options: 'i' } },
          { description: { $regex: 'soup', $options: 'i' } },
        ],
        category: 'Lunch',
        'ingredients.name': { $all: ['water', 'salt'] },
        tags: { $all: ['easy'] },
        prepTime: { $gte: 5, $lte: 20 },
        portions: { $gte: 1, $lte: 3 },
        userId: 'abc123',
        privacy: PrivacyLevel.PRIVATE,
      });
    });
  });

  describe('buildRecipeSort', () => {
    it('should default to CREATED_AT when no sortBy provided', () => {
      const result = buildRecipeSort({
        order: SortOrder.DESC,
      } as RecipeFilterQueryDto);

      expect(result).toEqual({
        [RecipeSortKeys.CREATED_AT]: -1,
      });
    });

    it('should sort ascending when order is ASC', () => {
      const result = buildRecipeSort({
        sortBy: RecipeSortKeys.CREATED_AT,
        order: SortOrder.ASC,
      } as RecipeFilterQueryDto);

      expect(result).toEqual({
        createdAt: 1,
      });
    });

    it('should sort descending when order is DESC', () => {
      const result = buildRecipeSort({
        sortBy: RecipeSortKeys.TITLE,
        order: SortOrder.DESC,
      } as RecipeFilterQueryDto);

      expect(result).toEqual({
        title: -1,
      });
    });
  });
});
