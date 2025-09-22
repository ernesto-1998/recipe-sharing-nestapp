import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationInfoDto } from './pagination-info.dto';

export class PaginatedResponseDto<TData> {
  @ApiProperty({ type: () => PaginationInfoDto })
  @Type(() => PaginationInfoDto)
  info: PaginationInfoDto;

  @ApiProperty({ isArray: true })
  results: TData[];
}
