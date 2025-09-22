import {
  CreateUserDto,
  UpdateUserDto,
  ResponseUserDto,
  PaginatedUsersResponseDto,
} from '../../../modules/user/dto';
import { Profile } from '../../../modules/user/schemas/profile.schema';

export type MockResponseUser = Omit<ResponseUserDto, 'password'>;

export const mockUser: MockResponseUser = {
  _id: '60f7c0e2e2a2c2a4d8e2e2a2',
  email: 'robert@example.com',
  username: 'robert123',
  role: 'user',
  profile: {} as Profile,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockPaginationInfo = {
  count: 1,
  pages: 1,
  next: null,
  prev: null,
};

export const mockPaginatedUsers: PaginatedUsersResponseDto = {
  info: mockPaginationInfo,
  results: [mockUser],
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
