import {
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipeRepository } from './recipe.repository';
import type { AppLogger } from 'src/common/interfaces';
import { CustomToken } from 'src/common/enums';
import { ResponseRecipeDto } from './dto';
import { Mapper } from 'src/common/utils/mapper';
import { PaginationQueryDto } from 'src/common/dto';
import { PaginatedRecipesResponseDto } from './dto/paginated-recipes-response.dto';
import { buildPaginationInfo } from 'src/common/utils/pagination';
import { UserService } from '../user/user.service';

@Injectable()
export class RecipeService {
  constructor(
    private readonly recipeRepository: RecipeRepository,
    private readonly userService: UserService,
    @Inject(CustomToken.APP_LOGGER) private readonly logger: AppLogger,
  ) {}

  async findAll(
    { page = 1, limit = 10 }: PaginationQueryDto,
    baseUrl: string,
  ): Promise<PaginatedRecipesResponseDto> {
    const skip = (page - 1) * limit;

    const [recipes, total] = await Promise.all([
      this.recipeRepository.findAll({ skip, limit }),
      this.recipeRepository.count(),
    ]);

    return {
      info: buildPaginationInfo(total, page, limit, baseUrl),
      results: Mapper.toResponseMany(ResponseRecipeDto, recipes),
    };
  }

  async findAllByUserId(
    userId: string,
    { page = 1, limit = 10 }: PaginationQueryDto,
    baseUrl: string,
  ): Promise<PaginatedRecipesResponseDto> {
    const skip = (page - 1) * limit;

    const [recipes, total] = await Promise.all([
      this.recipeRepository.findAllByUserId(userId, { skip, limit }),
      this.recipeRepository.count(),
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

  async create(createRecipeDto: CreateRecipeDto): Promise<ResponseRecipeDto> {
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
