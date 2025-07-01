import { Exclude, Expose } from 'class-transformer';
import { Profile } from '../schemas/profile.schema';

export class ResponseUserDto {
  @Expose()
  _id: string;

  @Expose()
  email: string;

  @Expose()
  username: string;

  @Expose()
  role: string;

  @Expose()
  profile: Profile;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Exclude()
  password: string;

  @Exclude()
  __v?: number;
}
