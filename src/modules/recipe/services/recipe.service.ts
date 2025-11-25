import {
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RecipeRepository } from '../repositories/recipe.repository';
import { UserService } from 'src/modules/user/services/user.service';
import type { AppLogger } from 'src/common/interfaces';
import { CustomToken, PrivacyLevel } from 'src/common/enums';
import {
  CreateRecipeDto,
  MyRecipesFilterQueryDto,
  PaginatedRecipesResponseDto,
  RecipeFilterQueryDto,
  ResponseRecipeDto,
  UpdateRecipeDto,
} from '../dto';
import { buildRecipeFilter, buildRecipeSort } from '../utils';
import { buildPaginationInfo } from 'src/common/utils/pagination';
import { Mapper } from 'src/common/utils/mapper';

@Injectable()
export class RecipeService {
  constructor(
    private readonly recipeRepository: RecipeRepository,
    private readonly userService: UserService,
    @Inject(CustomToken.APP_LOGGER) private readonly logger: AppLogger,
  ) {}

  async findAll(
    query: RecipeFilterQueryDto,
    baseUrl: string,
  ): Promise<PaginatedRecipesResponseDto> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const filter = buildRecipeFilter(query);
    const sort = buildRecipeSort(query);
    filter.privacy = PrivacyLevel.PUBLIC;

    const [recipes, total] = await Promise.all([
      this.recipeRepository.findAll({ filter, sort, skip, limit }),
      this.recipeRepository.count(filter),
    ]);
    return {
      info: buildPaginationInfo(total, page, limit, baseUrl),
      results: Mapper.toResponseMany(ResponseRecipeDto, recipes),
    };
  }

  async findAllMine(
    userId: string,
    query: MyRecipesFilterQueryDto,
    baseUrl: string,
  ): Promise<PaginatedRecipesResponseDto> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const filter = buildRecipeFilter(query);
    const sort = buildRecipeSort(query);
    filter.userId = userId;

    const [recipes, total] = await Promise.all([
      this.recipeRepository.findAll({ filter, sort, skip, limit }),
      this.recipeRepository.count(filter),
    ]);
    return {
      info: buildPaginationInfo(total, page, limit, baseUrl),
      results: Mapper.toResponseMany(ResponseRecipeDto, recipes),
    };
  }

  async findById(recipeId: string): Promise<ResponseRecipeDto> {
    const recipe = await this.recipeRepository.findById(recipeId);
    if (recipe === null)
      throw new NotFoundException('This recipe does not exists.');
    return Mapper.toResponse(ResponseRecipeDto, recipe);
  }

  async create(
    createRecipeDto: CreateRecipeDto & { userId: string },
  ): Promise<ResponseRecipeDto> {
    const user = await this.userService.findById(createRecipeDto.userId);
    if (!user) {
      throw new NotFoundException(
        `Author with ID ${createRecipeDto.userId} not found.`,
      );
    }
    const recipe = await this.recipeRepository.create(createRecipeDto);
    this.logger.log(
      {
        message: 'Recipe created.',
        recipeId: recipe._id,
        userId: recipe.userId,
      },
      RecipeService.name,
      HttpStatus.CREATED,
    );
    return Mapper.toResponse(ResponseRecipeDto, recipe);
  }

  async update(
    recipeId: string,
    updateRecipeDto: UpdateRecipeDto,
  ): Promise<ResponseRecipeDto> {
    const recipe = await this.recipeRepository.updateById(
      recipeId,
      updateRecipeDto,
    );
    if (recipe === null)
      throw new NotFoundException('This recipe does not exists.');
    this.logger.log(
      {
        message: 'Recipe updated.',
        recipeId: recipe._id,
        userId: recipe.userId,
        newValues: updateRecipeDto,
      },
      RecipeService.name,
      HttpStatus.OK,
    );
    return Mapper.toResponse(ResponseRecipeDto, recipe);
  }

  async remove(recipeId: string): Promise<ResponseRecipeDto> {
    const recipe = await this.recipeRepository.deleteById(recipeId);
    if (recipe === null)
      throw new NotFoundException('This recipe does not exists.');
    this.logger.log(
      {
        message: 'Recipe deleted.',
        recipeId: recipe._id,
        userId: recipe.userId,
      },
      RecipeService.name,
      HttpStatus.OK,
    );
    return Mapper.toResponse(ResponseRecipeDto, recipe);
  }
}
