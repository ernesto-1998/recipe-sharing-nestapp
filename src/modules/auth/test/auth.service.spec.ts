import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UserService } from '../../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { mockUser, mockMongoUser } from '../../../common/mocks';

jest.mock('bcrypt');

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

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: 'AppLogger', useValue: mockLogger },
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
      const input = { email: mockUser.email, password };

      mockUserService.checkIfUserExistsByEmail.mockResolvedValue(mockMongoUser);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.validateUser(input);

      expect(result).toEqual({
        userId: mockMongoUser._id.toHexString(),
        username: mockUser.username,
      });
    });

    it('should throw UnauthorizedException if email does not exist', async () => {
      mockUserService.checkIfUserExistsByEmail.mockResolvedValue(null);

      await expect(
        authService.validateUser({
          email: 'notfound@test.com',
          password: 'any',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      mockUserService.checkIfUserExistsByEmail.mockResolvedValue(mockMongoUser);

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.validateUser({
          email: mockMongoUser.email,
          password: 'wrong',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logIn', () => {
    it('should return access token and user info', async () => {
      const mockToken = 'mock.jwt.token';
      mockJwtService.signAsync.mockResolvedValue(mockToken);

      const user = { userId: mockUser._id, username: mockUser.username };
      const result = await authService.logIn(user);

      expect(result).toEqual({
        accessToken: mockToken,
        userId: user.userId,
        username: user.username,
      });

      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: user.userId,
        username: user.username,
      });
    });
  });
});
