import { FilterQuery } from 'mongoose';
import { CommentDocument } from '../schemas/comment.schema';

export type CommentFilterObject = FilterQuery<CommentDocument>;
