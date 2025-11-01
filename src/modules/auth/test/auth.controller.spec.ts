import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { UserService } from '../../user/user.service';
import {
  mockResponseUser,
  mockCreateUser,
  mockTokenUser,
} from '../../../common/mocks/user';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { LoginDto } from '../dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<AuthService>;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const mockAuthService = {
      logIn: jest.fn(),
    };

    const mockUserService = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    authController = module.get(AuthController);
    authService = module.get(AuthService);
    userService = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('login', () => {
    it('should return a token when login is successful', async () => {
      const mockResponse: AuthResponseDto = {
        accessToken: 'mock.token.value',
        userId: mockResponseUser._id,
        username: mockResponseUser.username,
      };
      const mockLoginBody: LoginDto = {
        email: mockCreateUser.email,
        password: mockCreateUser.password,
      };

      authService.logIn.mockResolvedValue(mockResponse);

      const result = await authController.login(mockLoginBody, mockTokenUser);

      expect(result).toEqual({
        accessToken: 'mock.token.value',
        userId: '60f7c0e2e2a2c2a4d8e2e2a2',
        username: 'robert123',
      });
      expect(authService.logIn).toHaveBeenCalledWith({
        userId: '60f7c0e2e2a2c2a4d8e2e2a2',
        username: 'robert123',
        isSuperUser: false,
      });
    });
  });

  describe('create (register)', () => {
    it('should create a user and return it', async () => {
      userService.create.mockResolvedValue(mockResponseUser);

      const result = await authController.create(mockCreateUser);

      expect(result).toEqual({
        _id: '60f7c0e2e2a2c2a4d8e2e2a2',
        email: 'robert@example.com',
        username: 'robert123',
        role: 'user',
        profile: {},
        createdAt: mockResponseUser.createdAt,
        updatedAt: mockResponseUser.updatedAt,
      });
      expect(userService.create).toHaveBeenCalledWith({
        email: 'robert@example.com',
        username: 'robert123',
        password: 'hashedPassword',
        role: 'user',
        profile: {},
      });
    });

    it('should throw ConflictException if user creation fails due to conflict', async () => {
      userService.create.mockRejectedValue(
        new ConflictException('User with this email already exists.'),
      );

      await expect(authController.create(mockCreateUser)).rejects.toThrow(
        ConflictException,
      );
      await expect(authController.create(mockCreateUser)).rejects.toThrow(
        'User with this email already exists.',
      );

      expect(userService.create).toHaveBeenCalledWith({
        email: 'robert@example.com',
        username: 'robert123',
        password: 'hashedPassword',
        role: 'user',
        profile: {},
      });
    });
  });
});
