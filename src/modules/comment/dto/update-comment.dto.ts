import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCommentDto } from './create-comment.dto';

export class UpdateCommentDtoOmitted extends OmitType(CreateCommentDto, [
    'recipeId',
] as const) {}

export class UpdateCommentDto extends PartialType(UpdateCommentDtoOmitted) {}
