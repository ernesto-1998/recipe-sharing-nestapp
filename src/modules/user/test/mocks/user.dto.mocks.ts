import { CreateUserDto } from '../../dto/create-user.dto';
import { ResponseUserDto } from '../../dto/response-user.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { Profile } from '../../schemas/profile.schema';

export type MockResponseUser = Omit<ResponseUserDto, 'password'>;

export const mockUser: MockResponseUser = {
  _id: '123',
  email: 'robert@example.com',
  username: 'robert123',
  role: 'user',
  profile: {} as Profile,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockCreateUser: CreateUserDto = {
  email: 'robert@example.com',
  username: 'robert123',
  password: 'hashedPassword',
  role: 'user',
  profile: {} as Profile,
};

export const mockUpdateUser: UpdateUserDto = {
  username: 'updatedUser',
};

export const mockUpdatedUser: MockResponseUser = {
  ...mockUser,
  username: 'updatedUser',
};
