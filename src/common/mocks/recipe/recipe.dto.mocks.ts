import { PrivacyLevel } from 'src/common/enums';
import {
  CreateRecipeDto,
  RecipeDto,
  ResponseRecipeDto,
} from 'src/modules/recipe/dto';

export const mockRecipe: RecipeDto = {
  _id: '60f8c0e2e2a2c2a4d8e2e2b3',
  userId: '60f7c0e2e2a2c2a4d8e2e2a2',
  title: 'Tostadas de aguacate',
  description: 'Un desayuno rápido y saludable con pan tostado y aguacate.',
  ingredients: [
    {
      name: 'Aguacate',
      quantity: '1',
      unit: 'unit',
    },
    {
      name: 'Pan integral',
      quantity: '2',
      unit: 'unit',
    },
  ],
  steps: [
    {
      order: 1,
      instruction: 'Tostar el pan hasta que quede dorado.',
    },
    {
      order: 2,
      instruction: 'Aplastar el aguacate y colocarlo sobre el pan tostado.',
    },
  ],
  prepTime: 600,
  portions: 1,
  category: 'Desayuno',
  images: ['https://example.com/tostadas-aguacate.jpg'],
  tags: ['rápido', 'saludable', 'vegetariano'],
  privacy: PrivacyLevel.PUBLIC,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockResponseRecipe: ResponseRecipeDto = {
  ...mockRecipe,
  author: {
    _id: mockRecipe.userId,
    username: 'robert123',
  },
};

export const mockPaginatedRecipes = {
  info: {
    count: 1,
    pages: 1,
    next: null,
    prev: null,
  },
  results: [mockResponseRecipe],
};

export const mockCreateRecipe: CreateRecipeDto = {
  title: 'Tostadas de aguacate',
  description: 'Un desayuno rápido y saludable con pan tostado y aguacate.',
  ingredients: [
    {
      name: 'Aguacate',
      quantity: '1',
      unit: 'unit',
    },
    {
      name: 'Pan integral',
      quantity: '2',
      unit: 'unit',
    },
  ],
  steps: [
    {
      order: 1,
      instruction: 'Tostar el pan hasta que quede dorado.',
    },
    {
      order: 2,
      instruction: 'Aplastar el aguacate y colocarlo sobre el pan tostado.',
    },
  ],
  prepTime: 600,
  portions: 1,
  category: 'Desayuno',
  images: ['https://example.com/tostadas-aguacate.jpg'],
  tags: ['rápido', 'saludable', 'vegetariano'],
  privacy: PrivacyLevel.PUBLIC,
};

export const mockUpdateRecipe: Partial<CreateRecipeDto> = {
  description: 'Un desayuno delicioso y saludable con pan tostado y aguacate.',
  prepTime: 700,
  tags: ['rápido', 'saludable', 'vegetariano', 'fácil'],
};

export const mockResponseUpdatedRecipe: ResponseRecipeDto = {
  ...mockResponseRecipe,
  description: 'Un desayuno delicioso y saludable con pan tostado y aguacate.',
  prepTime: 700,
  tags: ['rápido', 'saludable', 'vegetariano', 'fácil'],
};
