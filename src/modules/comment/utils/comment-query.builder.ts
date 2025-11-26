import { CommentFilterQueryDto } from '../dto/comment-filter-query.dto';
import { PrivacyLevel, SortOrder } from 'src/common/enums';
import { CommentSortKeys } from '../enums';
import { CommentFilterObject, CommentSortObject } from '../types';

export const buildCommentFilter = (
  filters: CommentFilterQueryDto,
): CommentFilterObject => {
  const { userId, recipeId, search } = filters;

  const filter: CommentFilterObject = {};

  if (userId) filter.userId = userId;
  if (recipeId) filter.recipeId = recipeId;

  if (search) {
    filter.$or = [{ text: { $regex: search, $options: 'i' } }];
  }

  return filter;
};

export const buildCommentSort = (
  filters: CommentFilterQueryDto,
): CommentSortObject => {
  const { sortBy, order } = filters;

  return {
    [sortBy || CommentSortKeys.CREATED_AT]: order === SortOrder.ASC ? 1 : -1,
  };
};
