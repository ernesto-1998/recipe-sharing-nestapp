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
import { CommentService } from '../services/comment.service';
import {
  CreateCommentDto,
  ResponseCommentDto,
  UpdateCommentDto,
  PaginatedCommentsResponseDto,
  CommentFilterQueryDto,
} from '../dto';
import { RequestContextService } from 'src/common/context/request-context.service';
import { ApiOkResponsePaginated, Public } from 'src/common/decorators';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { CommentOwnerGuard } from 'src/common/guards';
import { ParseMongoIdPipe } from 'src/common/pipes';
import { CurrentUser } from '../../auth/decorators';
import type { ITokenUser } from '../../auth/interfaces';

@Controller({ version: '1', path: 'comments' })
export class CommentController {
  constructor(
    private readonly requestCxt: RequestContextService,
    private readonly commentService: CommentService,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Get all comments (paginated)' })
  @ApiOkResponsePaginated(ResponseCommentDto)
  @Get()
  async findAll(
    @Query() commentFilterQueryDto: CommentFilterQueryDto,
  ): Promise<PaginatedCommentsResponseDto> {
    const baseUrl = this.requestCxt.getContext()?.full_url || '';
    return this.commentService.findAll(commentFilterQueryDto, baseUrl);
  }

  @ApiOperation({ summary: 'Get a comment by his ID.' })
  @ApiOkResponse({
    description: 'Successfully retrieved the comment by his ID.',
    type: ResponseCommentDto,
  })
  @ApiNotFoundResponse({
    description: 'Comment not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'This comment does not exists.',
        error: 'Not Found.',
      },
    },
  })
  @Get(':id')
  findById(@Param('id', ParseMongoIdPipe) id: string) {
    return this.commentService.findById(id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Creates a new comment.' })
  @ApiCreatedResponse({
    description: 'Successfully created a new comment.',
    type: ResponseCommentDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid data.' })
  @Post()
  create(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() { userId }: ITokenUser,
  ): Promise<ResponseCommentDto> {
    return this.commentService.create({
      ...createCommentDto,
      userId: userId,
    });
  }

  @UseGuards(CommentOwnerGuard)
  @ApiOperation({ summary: 'Update a comment.' })
  @ApiOkResponse({
    description: 'Successfully retrieved the updated comment.',
    type: ResponseCommentDto,
  })
  @ApiNotFoundResponse({
    description: 'Comment not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'This comment does not exists.',
        error: 'Not Found.',
      },
    },
  })
  @Patch(':id')
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.update(id, updateCommentDto);
  }

  @UseGuards(CommentOwnerGuard)
  @ApiOperation({ summary: 'Delete a comment.' })
  @ApiOkResponse({
    description: 'Successfully retrieved the deleted comment.',
    type: ResponseCommentDto,
  })
  @ApiNotFoundResponse({
    description: 'Comment not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'This comment does not exists.',
        error: 'Not Found.',
      },
    },
  })
  @Delete(':id')
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.commentService.remove(id);
  }
}
