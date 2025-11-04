import { Types } from 'mongoose';
import { PrivacyLevel } from 'src/common/enums';
import { RecipeDocument } from 'src/modules/recipe/schemas/recipe.schema';

export const mockMongoRecipe = {
  _id: new Types.ObjectId('60f8c0e2e2a2c2a4d8e2e2b3'),
  userId: new Types.ObjectId('60f7c0e2e2a2c2a4d8e2e2a2'),
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
  $isDeleted: false,
  $isEmpty: () => false,
  $session: () => null,
} as unknown as RecipeDocument;

export const mockUpdatedMongoRecipe = {
  ...mockMongoRecipe,
  description: 'Un desayuno delicioso y saludable con pan tostado y aguacate.',
  prepTime: 700,
  tags: ['rápido', 'saludable', 'vegetariano', 'fácil'],
} as unknown as RecipeDocument;
