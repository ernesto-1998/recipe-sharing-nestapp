import { Injectable } from '@nestjs/common';
import { BaseOwnerGuard } from './base-owner.guard';
import { CommentService } from 'src/modules/comment/services/comment.service';

@Injectable()
export class CommentOwnerGuard extends BaseOwnerGuard {
  constructor(private readonly commentService: CommentService) {
    super(commentService, 'userId');
  }
}
