import {
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AppLogger } from 'src/common/interfaces';
import { CustomToken, PrivacyLevel } from 'src/common/enums';
import { buildPaginationInfo } from 'src/common/utils/pagination';
import { Mapper } from 'src/common/utils/mapper';
import { CommentRepository } from '../repositories/comment.repository';
import { UserService } from 'src/modules/user/services/user.service';
import {
  CommentFilterQueryDto,
  CreateCommentDto,
  PaginatedCommentsResponseDto,
  ResponseCommentDto,
  UpdateCommentDto,
} from '../dto';
import { buildCommentFilter, buildCommentSort } from '../utils';
import { RecipeService } from 'src/modules/recipe/services/recipe.service';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly userService: UserService,
    private readonly recipeService: RecipeService,
    @Inject(CustomToken.APP_LOGGER) private readonly logger: AppLogger,
  ) {}

  async findAll(
    query: CommentFilterQueryDto,
    baseUrl: string,
  ): Promise<PaginatedCommentsResponseDto> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const filter = buildCommentFilter(query);
    const sort = buildCommentSort(query);

    const [comments, total] = await Promise.all([
      this.commentRepository.findAll({ filter, sort, skip, limit }),
      this.commentRepository.count(filter),
    ]);
    return {
      info: buildPaginationInfo(total, page, limit, baseUrl),
      results: Mapper.toResponseMany(ResponseCommentDto, comments),
    };
  }

  async findById(commentId: string): Promise<ResponseCommentDto> {
    const comment = await this.commentRepository.findById(commentId);
    if (comment === null)
      throw new NotFoundException('This comment does not exists.');
    return Mapper.toResponse(ResponseCommentDto, comment);
  }

  async create(
    createCommentDto: CreateCommentDto & { userId: string },
  ): Promise<ResponseCommentDto> {
    const user = await this.userService.findById(createCommentDto.userId);
    if (!user) {
      throw new NotFoundException(
        `Author with ID ${createCommentDto.userId} not found.`,
      );
    }
    const recipe = await this.recipeService.findById(createCommentDto.recipeId);
    if (!recipe) {
      throw new NotFoundException(
        `Recipe with ID ${createCommentDto.recipeId} not found.`,
      );
    }
    const comment = await this.commentRepository.create(createCommentDto);
    this.logger.log(
      {
        message: 'Comment created.',
        commentId: comment._id,
        userId: comment.userId,
        recipeId: comment.recipeId,
      },
      CommentService.name,
      HttpStatus.CREATED,
    );
    return Mapper.toResponse(ResponseCommentDto, comment);
  }

  async update(
    commentId: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<ResponseCommentDto> {
    const comment = await this.commentRepository.updateById(
      commentId,
      updateCommentDto,
    );
    if (comment === null)
      throw new NotFoundException('This comment does not exists.');
    this.logger.log(
      {
        message: 'Comment updated.',
        commentId: comment._id,
        userId: comment.userId,
        recipeId: comment.recipeId,
        newValues: updateCommentDto,
      },
      CommentService.name,
      HttpStatus.OK,
    );
    return Mapper.toResponse(ResponseCommentDto, comment);
  }

  async remove(commentId: string): Promise<ResponseCommentDto> {
    const comment = await this.commentRepository.deleteById(commentId);
    if (comment === null)
      throw new NotFoundException('This comment does not exists.');
    this.logger.log(
      {
        message: 'Comment deleted.',
        commentId: comment._id,
        userId: comment.userId,
        recipeId: comment.recipeId,
      },
      CommentService.name,
      HttpStatus.OK,
    );
    return Mapper.toResponse(ResponseCommentDto, comment);
  }
}
