import { SortOrder } from 'src/common/enums';
import {
  CommentDto,
  CommentFilterQueryDto,
  CreateCommentDto,
  ResponseCommentDto,
  UpdateCommentDto,
} from 'src/modules/comment/dto';
import { CommentSortKeys } from 'src/modules/comment/enums';

export const mockComment: CommentDto = {
  _id: '64b7f9f5e1d3c2a1b2c3d4e5',
  userId: '60f7c0e2e2a2c2a4d8e2e2a2',
  recipeId: '60f8c0e2e2a2c2a4d8e2e2b3',
  text: 'This is a mock comment for testing purposes.',
  createdAt: new Date('2024-01-01T12:00:00Z'),
  updatedAt: new Date('2024-01-01T12:00:00Z'),
};

export const mockCreateComment: CreateCommentDto = {
  recipeId: mockComment.recipeId,
  text: mockComment.text,
};

export const mockUpdateComment: UpdateCommentDto = {
  text: 'This is an updated mock comment for testing purposes.',
};

export const mockResponseUpdatedComment: CommentDto = {
  ...mockComment,
  text: 'This is an updated mock comment for testing purposes.',
  updatedAt: new Date('2024-01-02T12:00:00Z'),
};

export const mockResponseComment: ResponseCommentDto = {
  ...mockComment,
};

export const mockPaginationInfoComments = {
  count: 1,
  pages: 1,
  next: null,
  prev: null,
};

export const mockPaginatedComments = {
  info: mockPaginationInfoComments,
  results: [mockResponseComment],
};

export const mockCommentFilterQuery: CommentFilterQueryDto = {
  userId: mockComment.userId,
  recipeId: mockComment.recipeId,
  search: 'mock',
  sortBy: CommentSortKeys.CREATED_AT,
  order: SortOrder.ASC,
  page: 1,
  limit: 10,
};
