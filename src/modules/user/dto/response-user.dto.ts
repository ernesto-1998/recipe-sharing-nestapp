import { Exclude, Expose } from 'class-transformer';
import { Profile } from '../schemas/profile.schema';

export class ResponseUserDto {
  @Expose()
  email: string;

  @Expose()
  username: string;

  @Expose()
  role: string;

  @Expose()
  profile: Profile; // Podés tiparlo mejor si querés

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Exclude()
  passwordHash: string;
}
