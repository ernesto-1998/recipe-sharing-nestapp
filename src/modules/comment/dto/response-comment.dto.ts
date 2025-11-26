import { OmitType } from '@nestjs/swagger';
import { CommentDto } from './comment.dto';
import { Exclude } from 'class-transformer';

export class ResponseCommentDto extends OmitType(CommentDto, [
  '__v',
] as const) {
    @Exclude()
    __v?: number;
}
