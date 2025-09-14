import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StepDto } from './step.dto';
import { IngredientDto } from './ingredient.dto';

export class RecipeDto {
  @ApiProperty({
    example: '64c9b2f3e8a1a2b4c56789de',
    description: 'Unique identifier of the recipe',
  })
  @IsMongoId()
  _id: string;

  @ApiProperty({
    example: '64c9b2f3e8a1a2b4c56789df',
    description: 'ID of the author (user)',
  })
  @IsMongoId()
  authorId: string;

  @ApiProperty({
    example: 'Tomato Soup',
    description: 'Title of the recipe',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiProperty({
    example: 'A simple and delicious tomato soup recipe.',
    description: 'Detailed description of the recipe',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  description: string;

  @ApiProperty({
    type: [IngredientDto],
    description: 'List of ingredients used in the recipe',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngredientDto)
  ingredients: IngredientDto[];

  @ApiProperty({
    type: [StepDto],
    description: 'Step-by-step instructions for the recipe',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepDto)
  steps: StepDto[];

  @ApiProperty({
    example: 30,
    description: 'Preparation time in minutes',
  })
  @IsNumber()
  prepTime: number;

  @ApiProperty({
    example: 4,
    description: 'Number of portions the recipe yields',
  })
  @IsNumber()
  portions: number;

  @ApiProperty({
    example: 'Soup',
    description: 'Category of the recipe',
  })
  @IsString()
  category: string;

  @ApiPropertyOptional({
    example: ['https://example.com/image1.jpg'],
    description: 'List of image URLs for the recipe',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({
    example: ['vegan', 'healthy'],
    description: 'Tags to classify and search recipes',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    example: true,
    description: 'Whether the recipe is public (true) or private (false)',
  })
  @IsBoolean()
  visibility: boolean;

  @ApiPropertyOptional({
    example: '2025-08-28T10:15:30.000Z',
    description: 'Date when the recipe was created',
  })
  @IsOptional()
  @IsDate()
  createdAt?: Date;

  @ApiPropertyOptional({
    example: '2025-08-28T12:00:00.000Z',
    description: 'Date when the recipe was last updated',
  })
  @IsOptional()
  @IsDate()
  updatedAt?: Date;

  @ApiPropertyOptional({
    example: 0,
    description: 'Document version (managed by MongoDB)',
  })
  @IsOptional()
  __v?: number;
}
