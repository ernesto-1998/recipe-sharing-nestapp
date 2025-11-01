import { Test, TestingModule } from '@nestjs/testing';
import { RecipeController } from '../recipe.controller';
import { RecipeService } from '../recipe.service';
import { RequestContextService } from 'src/common/context/request-context.service';
import {
  mockCreateRecipe,
  mockPaginatedRecipes,
  mockRecipe,
  mockResponseRecipe,
  mockResponseUpdatedRecipe,
  mockUpdateRecipe,
} from 'src/common/mocks/recipe';
import { RecipeOwnerGuard } from 'src/common/guards/recipe-owner.guard';
import { NotFoundException } from '@nestjs/common';

class TestGuard {
  canActivate() {
    return true;
  }
}

describe('RecipeController', () => {
  let recipeController: RecipeController;
  let recipeService: jest.Mocked<RecipeService>;
  let requestContextService: jest.Mocked<RequestContextService>;

  beforeEach(async () => {
    const mockRecipeService = {
      findAll: jest.fn(),
      findAllMine: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const mockRequestContextService = {
      getContext: jest.fn().mockReturnValue({
        full_url: 'http://localhost:5000/recipes',
        protocol: 'http',
        host: 'localhost:5000',
        path: '/recipes',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipeController],
      providers: [
        {
          provide: RecipeService,
          useValue: mockRecipeService,
        },
        {
          provide: RequestContextService,
          useValue: mockRequestContextService,
        },
      ],
    })
      .overrideGuard(RecipeOwnerGuard)
      .useValue(new TestGuard())
      .compile();

    recipeController = module.get(RecipeController);
    recipeService = module.get(RecipeService);
    requestContextService = module.get(RequestContextService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(recipeController).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of recipes', async () => {
      recipeService.findAll.mockResolvedValueOnce(mockPaginatedRecipes);

      const result = await recipeController.findAll({
        category: 'Desayuno',
        page: 1,
        limit: 10,
      });

      expect(result).toEqual(mockPaginatedRecipes);
      expect(recipeService.findAll).toHaveBeenCalled();
      expect(recipeService.findAll).toHaveBeenCalledWith(
        {
          category: 'Desayuno',
          page: 1,
          limit: 10,
        },
        'http://localhost:5000/recipes',
      );
      expect(requestContextService.getContext).toHaveBeenCalled();
    });
  });

  describe('findAllMine', () => {
    it('should return an array of recipes of the authenticated user', async () => {
      recipeService.findAllMine.mockResolvedValueOnce(mockPaginatedRecipes);

      const result = await recipeController.findAllMine(
        { page: 1, limit: 10 },
        {
          userId: mockRecipe.userId,
          username: 'robert123',
          isSuperUser: false,
        },
      );

      expect(result).toEqual(mockPaginatedRecipes);
      expect(recipeService.findAllMine).toHaveBeenCalled();
      expect(recipeService.findAllMine).toHaveBeenCalledWith(
        '60f7c0e2e2a2c2a4d8e2e2a2',
        { page: 1, limit: 10 },
        'http://localhost:5000/recipes',
      );
      expect(requestContextService.getContext).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a recipe by its id', async () => {
      recipeService.findById.mockResolvedValueOnce(mockResponseRecipe);

      const result = await recipeController.findById(mockRecipe._id);

      expect(result).toEqual(mockResponseRecipe);
      expect(recipeService.findById).toHaveBeenCalledWith(
        '60f8c0e2e2a2c2a4d8e2e2b3',
      );
    });

    it('should throw NotFoundException if recipe is not found by id', async () => {
      recipeService.findById.mockRejectedValue(
        new NotFoundException('This recipe does not exists.'),
      );

      await expect(recipeController.findById(mockRecipe._id)).rejects.toThrow(
        NotFoundException,
      );
      await expect(recipeController.findById(mockRecipe._id)).rejects.toThrow(
        'This recipe does not exists.',
      );

      expect(recipeService.findById).toHaveBeenCalledWith(
        '60f8c0e2e2a2c2a4d8e2e2b3',
      );
    });
  });

  describe('create', () => {
    it('should create and return a new recipe', async () => {
      recipeService.create.mockResolvedValueOnce(mockResponseRecipe);
      const user = {
        userId: '60f7c0e2e2a2c2a4d8e2e2a2',
        username: 'robert123',
        isSuperUser: false,
      };
      const result = await recipeController.create(mockCreateRecipe, user);

      expect(result).toEqual(mockResponseRecipe);
      expect(recipeService.create).toHaveBeenCalledWith({
        ...mockCreateRecipe,
        userId: '60f7c0e2e2a2c2a4d8e2e2a2',
      });
    });

    it('should throw NotFoundException if author user is not found', async () => {
      recipeService.create.mockRejectedValue(
        new NotFoundException(
          'Author with ID 60f7c0e2e2a2c2a4d8e2e2a2 not found.',
        ),
      );
      const user = {
        userId: '60f7c0e2e2a2c2a4d8e2e2a2',
        username: 'robert123',
        isSuperUser: false,
      };

      await expect(
        recipeController.create(mockCreateRecipe, user),
      ).rejects.toThrow(NotFoundException);
      await expect(
        recipeController.create(mockCreateRecipe, user),
      ).rejects.toThrow('Author with ID 60f7c0e2e2a2c2a4d8e2e2a2 not found.');

      expect(recipeService.create).toHaveBeenCalledWith({
        ...mockCreateRecipe,
        userId: '60f7c0e2e2a2c2a4d8e2e2a2',
      });
    });
  });

  describe('update', () => {
    it('should update and return the recipe', async () => {
      recipeService.update.mockResolvedValueOnce(mockResponseUpdatedRecipe);
      const result = await recipeController.update(
        mockRecipe._id,
        mockUpdateRecipe,
      );

      expect(result).toEqual({
        ...mockResponseRecipe,
        description:
          'Un desayuno delicioso y saludable con pan tostado y aguacate.',
        prepTime: 700,
        tags: ['rápido', 'saludable', 'vegetariano', 'fácil'],
      });
      expect(recipeService.update).toHaveBeenCalledWith(
        '60f8c0e2e2a2c2a4d8e2e2b3',
        {
          description:
            'Un desayuno delicioso y saludable con pan tostado y aguacate.',
          prepTime: 700,
          tags: ['rápido', 'saludable', 'vegetariano', 'fácil'],
        },
      );
    });

    it('should throw NotFoundException if recipe to update is not found', async () => {
      recipeService.update.mockRejectedValue(
        new NotFoundException('This recipe does not exists.'),
      );

      await expect(
        recipeController.update(mockRecipe._id, mockUpdateRecipe),
      ).rejects.toThrow(NotFoundException);
      await expect(
        recipeController.update(mockRecipe._id, mockUpdateRecipe),
      ).rejects.toThrow('This recipe does not exists.');

      expect(recipeService.update).toHaveBeenCalledWith(
        '60f8c0e2e2a2c2a4d8e2e2b3',
        {
          description:
            'Un desayuno delicioso y saludable con pan tostado y aguacate.',
          prepTime: 700,
          tags: ['rápido', 'saludable', 'vegetariano', 'fácil'],
        },
      );
    });
  });

  describe('remove', () => {
    it('should remove and return the deleted recipe', async () => {
      recipeService.remove.mockResolvedValueOnce(mockResponseRecipe);
      const result = await recipeController.remove(mockRecipe._id);

      expect(result).toEqual(mockResponseRecipe);
      expect(recipeService.remove).toHaveBeenCalledWith(
        '60f8c0e2e2a2c2a4d8e2e2b3',
      );
    });

    it('should throw NotFoundException if recipe to delete is not found', async () => {
      recipeService.remove.mockRejectedValue(
        new NotFoundException('This recipe does not exists.'),
      );

      await expect(recipeController.remove(mockRecipe._id)).rejects.toThrow(
        NotFoundException,
      );
      await expect(recipeController.remove(mockRecipe._id)).rejects.toThrow(
        'This recipe does not exists.',
      );

      expect(recipeService.remove).toHaveBeenCalledWith(
        '60f8c0e2e2a2c2a4d8e2e2b3',
      );
    });
  });
});
