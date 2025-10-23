import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'OldPassword123!',
    description: 'Current password of the user',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    example: 'NewPassword456!',
    description:
      'New password to be set. Must have at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character.',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/, {
    message:
      'New Password too weak. It must contain uppercase, lowercase, number, and special character.',
  })
  newPassword: string;
}
