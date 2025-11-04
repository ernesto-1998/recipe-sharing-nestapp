import { Test } from '@nestjs/testing';
import { RecipeService } from '../recipe.service';
import { Mapper } from 'src/common/utils/mapper';
import { buildPaginationInfo } from 'src/common/utils/pagination';
import { RecipeRepository } from '../recipe.repository';
import { AppLogger } from 'src/common/interfaces';
import { CustomToken } from 'src/common/enums';
import { mockLogger } from 'src/common/mocks/logger';
import { RecipeDocument } from '../schemas/recipe.schema';
import {
  mockMongoRecipe,
  mockPaginatedRecipes,
  mockPaginationInfoRecipes,
  mockRecipe,
  mockResponseRecipe,
} from 'src/common/mocks/recipe';
import { UserService } from 'src/modules/user/user.service';
import { ResponseRecipeDto } from '../dto';
import { NotFoundException } from '@nestjs/common';

jest.mock('src/common/utils/mapper', () => ({
  Mapper: {
    toResponse: jest.fn(),
    toResponseMany: jest.fn(),
  },
}));

jest.mock('src/common/utils/pagination', () => ({
  buildPaginationInfo: jest.fn(),
}));

describe('RecipeService', () => {
  let recipeService: RecipeService;
  let userService: jest.Mocked<UserService>;
  let recipeRepository: jest.Mocked<RecipeRepository>;
  let logger: jest.Mocked<AppLogger>;

  beforeEach(async () => {
    const mockRecipeRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
      count: jest.fn(),
    };

    const mockUserService = {
      findById: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        RecipeService,
        { provide: RecipeRepository, useValue: mockRecipeRepository },
        { provide: UserService, useValue: mockUserService },
        { provide: CustomToken.APP_LOGGER, useValue: mockLogger },
      ],
    }).compile();

    recipeService = module.get(RecipeService);
    userService = module.get(UserService);
    recipeRepository = module.get(RecipeRepository);
    logger = module.get(CustomToken.APP_LOGGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated recipes', async () => {
      const recipes: RecipeDocument[] = [mockMongoRecipe];
      recipeRepository.findAll.mockResolvedValue(recipes);
      recipeRepository.count.mockResolvedValue(1);
      (Mapper.toResponseMany as jest.Mock).mockReturnValue([
        mockResponseRecipe,
      ]);
      (buildPaginationInfo as jest.Mock).mockReturnValue(
        mockPaginationInfoRecipes,
      );

      const result = await recipeService.findAll(
        {
          category: 'Desayuno',
          page: 1,
          limit: 10,
        },
        'http://localhost:5000/recipes',
      );
      expect(recipeRepository.findAll).toHaveBeenCalledWith({
        filter: { category: 'Desayuno', privacy: 'public' },
        sort: {
          createdAt: -1,
        },
        skip: 0,
        limit: 10,
      });
      expect(recipeRepository.count).toHaveBeenCalledWith({
        category: 'Desayuno',
        privacy: 'public',
      });
      expect(Mapper.toResponseMany).toHaveBeenCalledWith(
        ResponseRecipeDto,
        recipes,
      );
      expect(buildPaginationInfo).toHaveBeenCalledWith(
        1,
        1,
        10,
        'http://localhost:5000/recipes',
      );
      expect(result).toEqual(mockPaginatedRecipes);
    });
  });

  describe('findAllMine', () => {
    it('should return paginated recipes fo the Authenticated User', async () => {
      const recipes: RecipeDocument[] = [mockMongoRecipe];
      recipeRepository.findAll.mockResolvedValue(recipes);
      recipeRepository.count.mockResolvedValue(1);
      (Mapper.toResponseMany as jest.Mock).mockReturnValue([
        mockResponseRecipe,
      ]);
      (buildPaginationInfo as jest.Mock).mockReturnValue(
        mockPaginationInfoRecipes,
      );

      const result = await recipeService.findAllMine(
        '60f7c0e2e2a2c2a4d8e2e2a2',
        {
          category: 'Desayuno',
          page: 1,
          limit: 10,
        },
        'http://localhost:5000/recipes',
      );
      expect(recipeRepository.findAll).toHaveBeenCalledWith({
        filter: { category: 'Desayuno', userId: '60f7c0e2e2a2c2a4d8e2e2a2' },
        sort: {
          createdAt: -1,
        },
        skip: 0,
        limit: 10,
      });
      expect(recipeRepository.count).toHaveBeenCalledWith({
        category: 'Desayuno',
        userId: '60f7c0e2e2a2c2a4d8e2e2a2',
      });
      expect(Mapper.toResponseMany).toHaveBeenCalledWith(
        ResponseRecipeDto,
        recipes,
      );
      expect(buildPaginationInfo).toHaveBeenCalledWith(
        1,
        1,
        10,
        'http://localhost:5000/recipes',
      );
      expect(result).toEqual(mockPaginatedRecipes);
    });
  });

  describe('findById', () => {
    it('should return a recipe by its id', async () => {
      recipeRepository.findById.mockResolvedValue(mockMongoRecipe);
      (Mapper.toResponse as jest.Mock).mockReturnValue(mockResponseRecipe);

      const result = await recipeService.findById(mockRecipe._id);
      expect(recipeRepository.findById).toHaveBeenCalledWith(
        '60f8c0e2e2a2c2a4d8e2e2b3',
      );
      expect(Mapper.toResponse).toHaveBeenCalledWith(
        ResponseRecipeDto,
        mockMongoRecipe,
      );
      expect(result).toEqual(mockResponseRecipe);
    });

    it('should throw NotFoundException if recipe does not exist', async () => {
      recipeRepository.findById.mockResolvedValue(null);

      await expect(recipeService.findById(mockRecipe._id)).rejects.toThrow(
        NotFoundException,
      );
      await expect(recipeService.findById(mockRecipe._id)).rejects.toThrow(
        'This recipe does not exists.',
      );
      expect(Mapper.toResponse).not.toHaveBeenCalled();
    });
  });
});
