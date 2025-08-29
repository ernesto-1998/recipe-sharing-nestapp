import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Profile } from '../schemas/profile.schema';

export class ResponseUserDto {
  @ApiProperty({
    example: '64c9b2f3e8a1a2b4c56789de',
    description: 'Unique identifier of the user',
  })
  @Expose()
  _id: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address of the user',
  })
  @Expose()
  email: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'Username of the user',
  })
  @Expose()
  username: string;

  @ApiProperty({
    example: 'admin',
    description: 'Role assigned to the user',
  })
  @Expose()
  role: string;

  @ApiProperty({
    type: () => Profile,
    description: 'User profile object',
  })
  @Expose()
  profile: Profile;

  @ApiProperty({
    example: '2025-08-28T10:15:30.000Z',
    description: 'Date when the user was created',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2025-08-28T12:00:00.000Z',
    description: 'Date when the user was last updated',
  })
  @Expose()
  updatedAt: Date;

  @Exclude()
  password: string;

  @Exclude()
  __v?: number;
}
