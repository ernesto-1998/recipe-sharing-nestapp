import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { CreateRecipeDto, ResponseRecipeDto } from './dto';
import { UpdateRecipeDto } from './dto';
import { RequestContextService } from 'src/common/context/request-context.service';
import { ApiOkResponsePaginated, Public } from 'src/common/decorators';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto';
import { PaginatedRecipesResponseDto } from './dto/paginated-recipes-response.dto';
import { RecipeOwnerGuard } from 'src/common/guards/recipe-owner.guard';
import { ParseMongoIdPipe } from 'src/common/pipes';
import { RecipeFilterQueryDto } from './dto/recipe-filter-query.dto';
import { CurrentUser } from '../auth/decorators';
import type { ITokenUser } from '../auth/interfaces';

@Controller({ version: '1', path: 'recipes' })
export class RecipeController {
  constructor(
    private readonly requestCxt: RequestContextService,
    private readonly recipeService: RecipeService,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Get all recipes (paginated)' })
  @ApiOkResponsePaginated(ResponseRecipeDto)
  @Get()
  async findAll(
    @Query() recipeFilterQueryDto: RecipeFilterQueryDto,
  ): Promise<PaginatedRecipesResponseDto> {
    const baseUrl = this.requestCxt.getContext()?.full_url || '';
    return this.recipeService.findAll(recipeFilterQueryDto, baseUrl);
  }

  @Public()
  @ApiOperation({ summary: 'Get all recipes by author (paginated)' })
  @ApiOkResponsePaginated(ResponseRecipeDto)
  @Get('author/:id')
  findAllByUserId(
    @Param('id', ParseMongoIdPipe) id: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedRecipesResponseDto> {
    const baseUrl = this.requestCxt.getContext()?.full_url || '';
    return this.recipeService.findAllByUserId(id, paginationQuery, baseUrl);
  }

  @ApiOperation({ summary: 'Get a recipe by his ID.' })
  @ApiOkResponse({
    description: 'Successfully retrieved the recipe by his ID.',
    type: ResponseRecipeDto,
  })
  @ApiNotFoundResponse({
    description: 'Recipe not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'This recipe does not exists.',
        error: 'Not Found.',
      },
    },
  })
  @Get(':id')
  findById(@Param('id', ParseMongoIdPipe) id: string) {
    return this.recipeService.findById(id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Creates a new recipe.' })
  @ApiCreatedResponse({
    description: 'Successfully created a new recipe.',
    type: ResponseRecipeDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid data.' })
  @Post()
  create(
    @Body() createRecipeDto: CreateRecipeDto,
    @CurrentUser() user: ITokenUser,
  ): Promise<ResponseRecipeDto> {
    return this.recipeService.create({
      ...createRecipeDto,
      userId: user.userId,
    });
  }

  @UseGuards(RecipeOwnerGuard)
  @ApiOperation({ summary: 'Update a recipe.' })
  @ApiOkResponse({
    description: 'Successfully retrieved the updated recipe.',
    type: ResponseRecipeDto,
  })
  @ApiNotFoundResponse({
    description: 'Recipe not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'This recipe does not exists.',
        error: 'Not Found.',
      },
    },
  })
  @Patch(':id')
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
  ) {
    return this.recipeService.update(id, updateRecipeDto);
  }

  @UseGuards(RecipeOwnerGuard)
  @ApiOperation({ summary: 'Delete a recipe.' })
  @ApiOkResponse({
    description: 'Successfully retrieved the deleted recipe.',
    type: ResponseRecipeDto,
  })
  @ApiNotFoundResponse({
    description: 'Recipe not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'This recipe does not exists.',
        error: 'Not Found.',
      },
    },
  })
  @Delete(':id')
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.recipeService.remove(id);
  }
}
