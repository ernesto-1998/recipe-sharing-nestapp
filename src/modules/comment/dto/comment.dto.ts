import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMongoId,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsDate,
} from 'class-validator';

export class CommentDto {
  @ApiProperty({
    example: '64c9b2f3e8a1a2b4c56789de',
    description: 'Unique identifier of the comment',
  })
  @IsMongoId({
    message:
      'The provided ID does not match the expected format for identifiers.',
  })
  _id: string;

  @ApiProperty({
    example: '64c9b2f3e8a1a2b4c56789df',
    description: 'ID of the recipe being commented on',
  })
  @IsMongoId({
    message: 'recipeId must be a valid MongoDB ObjectId.',
  })
  recipeId: string;

  @ApiProperty({
    example: '64c9b2f3e8a1a2b4c56789e0',
    description: 'ID of the user who created the comment',
  })
  @IsMongoId({
    message: 'userId must be a valid MongoDB ObjectId.',
  })
  userId: string;

  @ApiProperty({
    example: 'This recipe was amazing!',
    description: 'Content of the user comment',
  })
  @IsString()
  @MinLength(1, { message: 'Comment must contain at least 1 character.' })
  @MaxLength(500, { message: 'Comment cannot exceed 500 characters.' })
  text: string;

  @ApiPropertyOptional({
    example: '2025-08-28T10:15:30.000Z',
    description: 'Date when the comment was created',
  })
  @IsOptional()
  @IsDate()
  createdAt?: Date;

  @ApiPropertyOptional({
    example: '2025-08-28T12:00:00.000Z',
    description: 'Date when the comment was last updated',
  })
  @IsOptional()
  @IsDate()
  updatedAt?: Date;

  @ApiPropertyOptional({
    example: 0,
    description: 'Document version (managed by MongoDB)',
  })
  @IsOptional()
  __v?: number;
}
