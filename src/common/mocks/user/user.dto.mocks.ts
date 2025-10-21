import {
  CreateUserDto,
  UpdateUserDto,
  ResponseUserDto,
  PaginatedUsersResponseDto,
} from '../../../modules/user/dto';
import { Profile } from '../../../modules/user/schemas/profile.schema';

export type MockResponseUser = Omit<ResponseUserDto, 'password'>;

export const mockResponseUser: MockResponseUser = {
  _id: '60f7c0e2e2a2c2a4d8e2e2a2',
  email: 'robert@example.com',
  username: 'robert123',
  role: 'user',
  profile: {},
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
  results: [mockResponseUser],
};

export const mockLoginUser = {
  userId: mockResponseUser._id,
  username: mockResponseUser.username,
};

export const mockCreateUser: CreateUserDto = {
  email: 'robert@example.com',
  username: 'robert123',
  password: 'hashedPassword',
  role: 'user',
  profile: {},
};

export const mockUpdateUser: UpdateUserDto = {
  username: 'updatedUser',
};

export const mockUpdatedUser: MockResponseUser = {
  ...mockResponseUser,
  username: 'updatedUser',
};
