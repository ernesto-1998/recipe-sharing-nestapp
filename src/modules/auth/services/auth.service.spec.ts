import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserService } from '../../user/services/user.service';
import { JwtService } from '@nestjs/jwt';
import { mockResponseUser, mockMongoUser } from '../../../common/mocks/user';
import { CustomToken } from 'src/common/enums/custom-tokens-providers.enum';
import { AppLogger } from 'src/common/interfaces';
import { mockLogger } from 'src/common/mocks/logger';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  let logger: jest.Mocked<AppLogger>;

  beforeEach(async () => {
    const mockUserService = {
      checkIfUserExistsByEmail: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: CustomToken.APP_LOGGER, useValue: mockLogger },
      ],
    }).compile();

    authService = module.get(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
    logger = module.get(CustomToken.APP_LOGGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user when email exists and password matches', async () => {
      const password = 'hashedPassword';
      const input = { email: mockResponseUser.email, password };

      userService.checkIfUserExistsByEmail.mockResolvedValue(mockMongoUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.validateUser(input);

      expect(userService.checkIfUserExistsByEmail).toHaveBeenCalledWith(
        'robert@example.com',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'hashedPassword',
        'hashedPassword',
      );
      expect(logger.log).toHaveBeenCalledWith(
        {
          message: 'User successfully authenticated',
          userId: '60f7c0e2e2a2c2a4d8e2e2a2',
          username: 'robert123',
          isSuperUser: false,
        },
        AuthService.name,
        HttpStatus.OK,
      );
      expect(result).toEqual({
        userId: '60f7c0e2e2a2c2a4d8e2e2a2',
        username: 'robert123',
        isSuperUser: false,
      });
    });

    it('should throw UnauthorizedException and log warning if email does not exist', async () => {
      const input = { email: 'notfound@test.com', password: 'any' };

      userService.checkIfUserExistsByEmail.mockResolvedValue(null);

      await expect(authService.validateUser(input)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.validateUser(input)).rejects.toThrow(
        'Invalid credentials.',
      );

      expect(userService.checkIfUserExistsByEmail).toHaveBeenCalledWith(
        'notfound@test.com',
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        {
          message: 'Invalid credentials attempt',
          email: 'notfound@test.com',
        },
        AuthService.name,
        HttpStatus.UNAUTHORIZED,
      );
      expect(logger.log).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException and log warning if password does not match', async () => {
      const input = {
        email: mockMongoUser.email,
        password: 'incorrectPassword',
      };

      userService.checkIfUserExistsByEmail.mockResolvedValue(mockMongoUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.validateUser(input)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.validateUser(input)).rejects.toThrow(
        'Invalid credentials.',
      );

      expect(userService.checkIfUserExistsByEmail).toHaveBeenCalledWith(
        'robert@example.com',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'incorrectPassword',
        'hashedPassword',
      );
      expect(logger.warn).toHaveBeenCalledWith(
        {
          message: 'Invalid credentials attempt',
          email: 'robert@example.com',
        },
        AuthService.name,
        HttpStatus.UNAUTHORIZED,
      );
      expect(logger.log).not.toHaveBeenCalled();
    });
  });

  describe('logIn', () => {
    it('should return access token and user info', async () => {
      const mockToken = 'mock.jwt.token';
      const user = {
        userId: mockResponseUser._id,
        username: mockResponseUser.username,
        isSuperUser: false,
      };

      jwtService.signAsync.mockResolvedValue(mockToken);

      const result = await authService.logIn(user);

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: user.userId,
        username: user.username,
        isSuperUser: false,
      });
      expect(logger.log).toHaveBeenCalledWith(
        {
          message: 'Access token issued',
          userId: '60f7c0e2e2a2c2a4d8e2e2a2',
        },
        AuthService.name,
        HttpStatus.OK,
      );
      expect(result).toEqual({
        accessToken: 'mock.jwt.token',
        userId: '60f7c0e2e2a2c2a4d8e2e2a2',
        username: 'robert123',
      });
    });
  });
});
