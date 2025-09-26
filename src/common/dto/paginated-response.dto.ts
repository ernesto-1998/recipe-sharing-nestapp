import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationInfoDto } from './pagination-info.dto';

export class PaginatedResponseDto<TData> {
  @ApiProperty({ type: () => PaginationInfoDto })
  @Type(() => PaginationInfoDto)
  info: PaginationInfoDto;

  @ApiProperty({
    description: 'List of results for the current page',
    isArray: true,
    type: () => Object,
  })
  results: TData[];
}
