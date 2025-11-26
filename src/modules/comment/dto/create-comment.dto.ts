import { OmitType } from '@nestjs/swagger';
import { CommentDto } from './comment.dto';

export class CreateCommentDto extends OmitType(CommentDto, [
  '_id',
  'userId',
  'createdAt',
  'updatedAt',
  '__v',
] as const) {}
