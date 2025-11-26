import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../schemas/comment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { CommentFilterObject, CommentSortObject } from '../types';
import { flattenObject } from 'src/common/utils/flatten';
import { CreateCommentDto, UpdateCommentDto } from '../dto';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
  ) {}

  findAll({
    filter,
    sort,
    skip = 0,
    limit = 10,
  }: {
    filter?: CommentFilterObject;
    sort?: CommentSortObject;
    skip?: number;
    limit?: number;
  } = {}): Promise<CommentDocument[]> {
    return this.commentModel
      .find({
        ...filter,
      })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  findById(commentId: string): Promise<CommentDocument | null> {
    return this.commentModel.findById(commentId).exec();
  }

  count(filter: CommentFilterObject = {}): Promise<number> {
    return this.commentModel
      .countDocuments({
        ...filter,
      })
      .exec();
  }

  create(createcommentDto: CreateCommentDto): Promise<CommentDocument> {
    const createdcomment = new this.commentModel(createcommentDto);
    return createdcomment.save();
  }

  updateById(
    commentId: string,
    updatecommentDto: UpdateCommentDto,
  ): Promise<CommentDocument | null> {
    return this.commentModel
      .findByIdAndUpdate(
        commentId,
        { $set: flattenObject(updatecommentDto as Record<string, unknown>) },
        { new: true, runValidators: true },
      )
      .exec();
  }

  deleteById(commentId: string): Promise<CommentDocument | null> {
    return this.commentModel.findByIdAndDelete(commentId).exec();
  }
}
