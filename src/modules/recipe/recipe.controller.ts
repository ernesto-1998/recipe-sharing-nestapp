import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { CreateRecipeDto, ResponseRecipeDto } from './dto';
import { UpdateRecipeDto } from './dto';
import { RequestContextService } from 'src/common/context/request-context.service';
import { ApiOkResponsePaginated, Public } from 'src/common/decorators';
import { ApiOperation } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto';
import { PaginatedRecipesResponseDto } from './dto/paginated-recipes-response.dto';

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
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedRecipesResponseDto> {
    const baseUrl = this.requestCxt.getContext()?.full_url || '';
    return this.recipeService.findAll(paginationQuery, baseUrl);
  }

  @Public()
  @ApiOperation({ summary: 'Get all recipes of an author (paginated)' })
  @ApiOkResponsePaginated(ResponseRecipeDto)
  @Get('author/:id')
  findAllByAuthorId(
    @Param('id') id: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    const baseUrl = this.requestCxt.getContext()?.full_url || '';
    return this.recipeService.findAllByAuthorId(id, paginationQuery, baseUrl);
  }

  @Post()
  create(@Body() createRecipeDto: CreateRecipeDto) {
    return this.recipeService.create(createRecipeDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recipeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRecipeDto: UpdateRecipeDto) {
    return this.recipeService.update(id, updateRecipeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recipeService.remove(id);
  }
}
