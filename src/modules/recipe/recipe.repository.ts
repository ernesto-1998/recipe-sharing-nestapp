import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Recipe, RecipeDocument } from './schemas/recipe.schema';
import { Model } from 'mongoose';
import { CreateRecipeDto, UpdateRecipeDto } from './dto';
import { flattenObject } from 'src/common/utils/flatten';

@Injectable()
export class RecipeRepository {
  constructor(
    @InjectModel(Recipe.name)
    private readonly recipeModel: Model<RecipeDocument>,
  ) {}

  findAll({
    skip = 0,
    limit = 10,
  }: {
    skip?: number;
    limit?: number;
  } = {}): Promise<RecipeDocument[]> {
    return this.recipeModel
      .find()
      .skip(skip)
      .limit(limit)
      .populate('author', '_id username')
      .exec();
  }

  findAllByAuthorId(
    authorId: string,
    {
      skip = 0,
      limit = 10,
    }: {
      skip?: number;
      limit?: number;
    } = {},
  ) {
    return this.recipeModel
      .find({
        authorId: authorId,
      })
      .skip(skip)
      .limit(limit)
      .populate('author', '_id username')
      .exec();
  }

  findById(recipeId: string): Promise<RecipeDocument | null> {
    return this.recipeModel
      .findById(recipeId)
      .populate('author', '_id username')
      .exec();
  }

  count(): Promise<number> {
    return this.recipeModel.countDocuments().exec();
  }

  create(createRecipeDto: CreateRecipeDto): Promise<RecipeDocument> {
    const createdRecipe = new this.recipeModel(createRecipeDto);
    return createdRecipe.save();
  }

  updateById(
    recipeId: string,
    updateRecipeDto: UpdateRecipeDto,
  ): Promise<RecipeDocument | null> {
    return this.recipeModel
      .findByIdAndUpdate(
        recipeId,
        { $set: flattenObject(updateRecipeDto as Record<string, unknown>) },
        { new: true, runValidators: true },
      )
      .exec();
  }

  deleteById(recipeId: string): Promise<RecipeDocument | null> {
    return this.recipeModel.findByIdAndDelete(recipeId).exec();
  }
}
