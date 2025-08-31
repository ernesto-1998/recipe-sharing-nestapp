import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

export class ErrorResponseDto {
  @ApiProperty({ example: 404, description: 'HTTP status code.' })
  statusCode: HttpStatus;

  @ApiProperty({
    example: ['User not found.'],
    description: 'Detailed error message(s).',
  })
  message: string | string[];

  @ApiProperty({
    example: 'Not Found',
    description: 'HTTP status message.',
  })
  error: string;
}
