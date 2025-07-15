import { CreateUserDto } from '../../modules/user/dto/create-user.dto';
import { ResponseUserDto } from '../../modules/user/dto/response-user.dto';
import { UpdateUserDto } from '../../modules/user/dto/update-user.dto';
import { Profile } from '../../modules/user/schemas/profile.schema';

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

export const mockLoginUser = {
  userId: mockUser._id,
  username: mockUser.username,
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
  email: 'updated@gmail.com',
};

export const mockUpdatedUser: MockResponseUser = {
  ...mockUser,
  username: 'updatedUser',
};
