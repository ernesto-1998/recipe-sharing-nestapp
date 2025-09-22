import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { UserService } from '../../user/user.service';
import {
  mockUser,
  mockLoginUser,
  mockCreateUser,
} from '../../../common/mocks/user';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { ConflictException } from '@nestjs/common';

const mockAuthService = {
  logIn: jest.fn(),
};

const mockUserService = {
  create: jest.fn(),
};

describe('AuthController', () => {
  let authController: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return a token when login is successful', async () => {
      const mockResponse: AuthResponseDto = {
        accessToken: 'mock.token.value',
        userId: mockUser._id,
        username: mockUser.username,
      };
      mockAuthService.logIn.mockResolvedValue(mockResponse);

      const result = await authController.login(mockLoginUser);

      expect(mockAuthService.logIn).toHaveBeenCalledWith(mockLoginUser);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('create (register)', () => {
    it('should create a user and return it', async () => {
      mockUserService.create.mockResolvedValue(mockUser);
      const result = await authController.create(mockCreateUser);
      expect(result).toEqual(mockUser);
      expect(mockUserService.create).toHaveBeenCalledWith(mockCreateUser);
    });

    it('should throw ConflictException if user creation fails due to conflict', async () => {
      mockUserService.create.mockRejectedValue(
        new ConflictException('User with this email already exists.'),
      );
      await expect(authController.create(mockCreateUser)).rejects.toThrow(
        ConflictException,
      );
      await expect(authController.create(mockCreateUser)).rejects.toThrow(
        'User with this email already exists.',
      );
      expect(mockUserService.create).toHaveBeenCalledWith(mockCreateUser);
    });
  });
});
