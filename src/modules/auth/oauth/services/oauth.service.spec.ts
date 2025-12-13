import { Test, TestingModule } from '@nestjs/testing';
import { OAuthService } from './oauth.service';
import { OAuthProviderFactory } from '../providers';
import { OAuthAccountRepository } from '../repositories/oauth.repository';
import { UserService } from 'src/modules/user/services/user.service';
import { AuthService } from '../../services/auth.service';
import { OAuthProviderName } from '../enums';
import { UserRolesLevel } from 'src/common/enums';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DeleteResult } from 'mongoose';
import type { OAuthUser } from '../types';
import type { ResponseUserDto } from 'src/modules/user/dto';

describe('OAuthService', () => {
  let service: OAuthService;

  const mockOAuthProvider = {
    authorize: jest.fn(),
    callback: jest.fn(),
  };

  const mockOAuthProviderFactory = {
    getProvider: jest.fn(),
  };

  const mockOAuthAccountRepository = {
    findOneByProvider: jest.fn(),
    create: jest.fn(),
    unlinkOAuthAccount: jest.fn(),
  };

  const mockUserService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    createFromOAuthUser: jest.fn(),
    updateIsOAuthUser: jest.fn(),
  };

  const mockAuthService = {
    logIn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthService,
        { provide: OAuthProviderFactory, useValue: mockOAuthProviderFactory },
        { provide: OAuthAccountRepository, useValue: mockOAuthAccountRepository },
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    service = module.get(OAuthService);

    jest.clearAllMocks();
  });

  describe('getAuthorizationUrl', () => {
    it('should return authorization url from provider', async () => {
      mockOAuthProviderFactory.getProvider.mockReturnValue(mockOAuthProvider);
      mockOAuthProvider.authorize.mockReturnValue('https://auth.url');

      const result = await service.getAuthorizationUrl(OAuthProviderName.GOOGLE);

      expect(result).toBe('https://auth.url');
      expect(mockOAuthProviderFactory.getProvider).toHaveBeenCalledWith(
        OAuthProviderName.GOOGLE,
      );
    });
  });

  describe('handleOAuthCallback', () => {
    it('should complete oauth flow and return access token', async () => {
      const oauthUser: OAuthUser = {
        id: 'google-id',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
      };

      const user: ResponseUserDto = {
        _id: 'user-id',
        username: 'testuser',
        email: oauthUser.email,
        isOAuthUser: true,
        role: UserRolesLevel.USER,
      } as ResponseUserDto;

      mockOAuthProviderFactory.getProvider.mockReturnValue(mockOAuthProvider);
      mockOAuthProvider.callback.mockResolvedValue(oauthUser);

      jest
        .spyOn<any, any>(service, 'handleOAuthLogin')
        .mockResolvedValue(user);

      mockAuthService.logIn.mockResolvedValue({ accessToken: 'jwt-token' });

      const result = await service.handleOAuthCallback(
        OAuthProviderName.GOOGLE,
        'auth-code',
      );

      expect(result).toEqual({ accessToken: 'jwt-token' });
      expect(mockOAuthProvider.callback).toHaveBeenCalledWith('auth-code');
      expect(mockAuthService.logIn).toHaveBeenCalledWith({
        userId: user._id,
        username: user.username,
        isSuperUser: false,
      });
    });
  });

  describe('handleOAuthLogin', () => {
    it('should return user if oauth account already exists', async () => {
      const user = {
        _id: 'user-id',
        username: 'oauthuser',
      };

      mockOAuthAccountRepository.findOneByProvider.mockResolvedValue({
        user,
      });

      const result = await service['handleOAuthLogin'](
        OAuthProviderName.GOOGLE,
        { id: 'provider-id', email: 'test@test.com' } as OAuthUser,
      );

      expect(result._id).toBe(user._id);
    });

    it('should link oauth account to existing user by email', async () => {
      const oauthUser: OAuthUser = {
        id: 'provider-id',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
      };

      const user = {
        _id: 'user-id',
        email: oauthUser.email,
        isOAuthUser: false,
      };

      mockOAuthAccountRepository.findOneByProvider.mockResolvedValue(null);
      mockUserService.findByEmail.mockResolvedValue(user);
      mockOAuthAccountRepository.create.mockResolvedValue(null);
      mockUserService.updateIsOAuthUser.mockResolvedValue(null);

      const result = await service['handleOAuthLogin'](
        OAuthProviderName.GOOGLE,
        oauthUser,
      );

      expect(mockOAuthAccountRepository.create).toHaveBeenCalled();
      expect(mockUserService.updateIsOAuthUser).toHaveBeenCalledWith(
        user._id,
        true,
      );
      expect(result.email).toBe(oauthUser.email);
    });

    it('should create new user if email does not exist', async () => {
      const oauthUser: OAuthUser = {
        id: 'provider-id',
        email: 'new@test.com',
        firstName: 'New',
        lastName: 'User',
      };

      const newUser = {
        _id: 'new-user-id',
        email: oauthUser.email,
        isOAuthUser: true,
      };

      mockOAuthAccountRepository.findOneByProvider.mockResolvedValue(null);
      mockUserService.findByEmail.mockRejectedValue(
        new NotFoundException(),
      );
      mockUserService.createFromOAuthUser.mockResolvedValue(newUser);
      mockOAuthAccountRepository.create.mockResolvedValue(null);

      const result = await service['handleOAuthLogin'](
        OAuthProviderName.GOOGLE,
        oauthUser,
      );

      expect(mockUserService.createFromOAuthUser).toHaveBeenCalledWith(
        oauthUser,
      );
      expect(result.email).toBe(oauthUser.email);
    });
  });

  describe('unlinkOAuthAccount', () => {
    it('should unlink oauth account successfully', async () => {
      const deleteResult: DeleteResult = {
        acknowledged: true,
        deletedCount: 1,
      };

      mockUserService.findById.mockResolvedValue({
        _id: 'user-id',
        isOAuthUser: true,
      });

      mockOAuthAccountRepository.unlinkOAuthAccount.mockResolvedValue(
        deleteResult,
      );

      const result = await service.unlinkOAuthAccount(
        'user-id',
        OAuthProviderName.GOOGLE,
      );

      expect(result).toEqual(deleteResult);
    });

    it('should throw if user not found', async () => {
      mockUserService.findById.mockResolvedValue(null);

      await expect(
        service.unlinkOAuthAccount('user-id', OAuthProviderName.GOOGLE),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if user is not oauth user', async () => {
      mockUserService.findById.mockResolvedValue({
        _id: 'user-id',
        isOAuthUser: false,
      });

      await expect(
        service.unlinkOAuthAccount('user-id', OAuthProviderName.GOOGLE),
      ).rejects.toThrow(BadRequestException);
    });
  });
});