import { plainToInstance } from 'class-transformer';
import { UserDocument } from './schemas/user.schema';
import { ResponseUserDto } from './dto/response-user.dto';

export class UserMapper {
  static toResponse(user: UserDocument): ResponseUserDto {
    return plainToInstance(ResponseUserDto, user.toObject());
  }

  static toResponseMany(users: UserDocument[]): ResponseUserDto[] {
    return users.map((user) => this.toResponse(user));
  }
}
