import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { UserService } from '../../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { mockResponseUser, mockMongoUser } from '../../../common/mocks/user';
import { CustomToken } from 'src/common/enums/custom-tokens-providers.enum';
import { AppLogger } from 'src/common/interfaces';

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

    const mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      verbose: jest.fn(),
      debug: jest.fn(),
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
      const password = 'plainPassword';
      const input = { email: mockResponseUser.email, password };

      userService.checkIfUserExistsByEmail.mockResolvedValue(mockMongoUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.validateUser(input);

      expect(userService.checkIfUserExistsByEmail).toHaveBeenCalledWith(
        input.email,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        password,
        mockMongoUser.password,
      );
      expect(logger.log).toHaveBeenCalledWith(
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

      userService.checkIfUserExistsByEmail.mockResolvedValue(null);

      await expect(authService.validateUser(input)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.validateUser(input)).rejects.toThrow(
        'Invalid credentials.',
      );

      expect(userService.checkIfUserExistsByEmail).toHaveBeenCalledWith(
        input.email,
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        {
          message: 'Invalid credentials attempt',
          email: input.email,
        },
        AuthService.name,
        HttpStatus.UNAUTHORIZED,
      );
      expect(logger.log).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException and log warning if password does not match', async () => {
      const input = { email: mockMongoUser.email, password: 'wrong' };

      userService.checkIfUserExistsByEmail.mockResolvedValue(mockMongoUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.validateUser(input)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.validateUser(input)).rejects.toThrow(
        'Invalid credentials.',
      );

      expect(userService.checkIfUserExistsByEmail).toHaveBeenCalledWith(
        input.email,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        input.password,
        mockMongoUser.password,
      );
      expect(logger.warn).toHaveBeenCalledWith(
        {
          message: 'Invalid credentials attempt',
          email: input.email,
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
          userId: user.userId,
        },
        AuthService.name,
        HttpStatus.OK,
      );
      expect(result).toEqual({
        accessToken: mockToken,
        userId: user.userId,
        username: user.username,
      });
    });
  });
});
