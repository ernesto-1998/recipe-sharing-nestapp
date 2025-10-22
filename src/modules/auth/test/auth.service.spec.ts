import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UserService } from '../../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { HttpStatus, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { mockResponseUser, mockMongoUser } from '../../../common/mocks/user';
import { CustomToken } from 'src/common/enums/custom-tokens-providers.enum';
import { AppLogger } from 'src/common/interfaces';

jest.mock('bcrypt');

const mockUserService = {
  checkIfUserExistsByEmail: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

const mockLogger: Partial<AppLogger> = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  verbose: jest.fn(),
  debug: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: CustomToken.APP_LOGGER, useValue: mockLogger },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user when email exists and password matches', async () => {
      const password = 'plainPassword';
      const input = { email: mockResponseUser.email, password };

      mockUserService.checkIfUserExistsByEmail.mockResolvedValue(mockMongoUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.validateUser(input);

      expect(mockUserService.checkIfUserExistsByEmail).toHaveBeenCalledWith(
        input.email,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        password,
        mockMongoUser.password,
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        {
          message: 'User successfully authenticated',
          userId: mockMongoUser._id.toHexString(),
          username: mockMongoUser.username,
          isSuperUser: false,
        },
        AuthService.name,
        HttpStatus.OK,
      );
      expect(result).toEqual({
        userId: mockMongoUser._id.toHexString(),
        username: mockMongoUser.username,
        isSuperUser: false,
      });
    });

    it('should throw UnauthorizedException and log warning if email does not exist', async () => {
      const input = { email: 'notfound@test.com', password: 'any' };
      mockUserService.checkIfUserExistsByEmail.mockResolvedValue(null);

      await expect(authService.validateUser(input)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.validateUser(input)).rejects.toThrow(
        'Invalid credentials.',
      );

      expect(mockUserService.checkIfUserExistsByEmail).toHaveBeenCalledWith(
        input.email,
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        {
          message: 'Invalid credentials attempt',
          email: input.email,
        },
        AuthService.name,
        HttpStatus.UNAUTHORIZED,
      );
      expect(mockLogger.log).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException and log warning if password does not match', async () => {
      const input = { email: mockMongoUser.email, password: 'wrong' };
      mockUserService.checkIfUserExistsByEmail.mockResolvedValue(mockMongoUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.validateUser(input)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.validateUser(input)).rejects.toThrow(
        'Invalid credentials.',
      );

      expect(mockUserService.checkIfUserExistsByEmail).toHaveBeenCalledWith(
        input.email,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        input.password,
        mockMongoUser.password,
      );
      expect(mockLogger.warn).toHaveBeenCalledWith(
        {
          message: 'Invalid credentials attempt',
          email: input.email,
        },
        AuthService.name,
        HttpStatus.UNAUTHORIZED,
      );
      expect(mockLogger.log).not.toHaveBeenCalled();
    });
  });

  describe('logIn', () => {
    it('should return access token and user info', async () => {
      const mockToken = 'mock.jwt.token';
      mockJwtService.signAsync.mockResolvedValue(mockToken);

      const user = {
        userId: mockResponseUser._id,
        username: mockResponseUser.username,
        isSuperUser: false,
      };
      const result = await authService.logIn(user);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: user.userId,
        username: user.username,
        isSuperUser: false,
      });
      expect(mockLogger.log).toHaveBeenCalledWith(
        {
          message: 'Access token issued',
          userId: user.userId,
        },
        AuthService.name,
        HttpStatus.OK, // 200
      );
      expect(result).toEqual({
        accessToken: mockToken,
        userId: user.userId,
        username: user.username,
      });
    });
  });
});
