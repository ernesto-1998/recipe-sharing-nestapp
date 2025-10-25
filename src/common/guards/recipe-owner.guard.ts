import { Injectable } from '@nestjs/common';
import { BaseOwnerGuard } from './base-owner.guard';
import { RecipeService } from 'src/modules/recipe/recipe.service';

@Injectable()
export class RecipeOwnerGuard extends BaseOwnerGuard {
  constructor(private readonly recipeService: RecipeService) {
    super(recipeService, 'userId');
  }
}
