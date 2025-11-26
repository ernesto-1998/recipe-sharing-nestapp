import { PaginatedResponseDto } from 'src/common/dto';
import { ResponseCommentDto } from './response-comment.dto';

export class PaginatedCommentsResponseDto extends PaginatedResponseDto<ResponseCommentDto> {}
