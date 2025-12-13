import { Test, TestingModule } from '@nestjs/testing';
import { OAuthController } from './oauth.controller';
import { OAuthService } from '../../services/oauth.service';
import { BadRequestException } from '@nestjs/common';
import { OAuthProviderName } from '../../enums';
import type { ITokenUser } from 'src/modules/auth/interfaces';
import { DeleteResult } from 'mongoose';

describe('OAuthController', () => {
  let controller: OAuthController;
  let oauthService: jest.Mocked<OAuthService>;

  beforeEach(async () => {

    const mockOAuthService = {
      getAuthorizationUrl: jest.fn(),
      handleOAuthCallback: jest.fn(),
      unlinkOAuthAccount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OAuthController],
      providers: [
        {
          provide: OAuthService,
          useValue: mockOAuthService,
        },
      ],
    }).compile();

    controller = module.get<OAuthController>(OAuthController);
    oauthService = module.get(OAuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authorize', () => {
    it('should return authorization url for provider', async () => {
      const authorizationUrl = 'https://accounts.google.com/auth';

      oauthService.getAuthorizationUrl.mockResolvedValue(authorizationUrl);

      const result = await controller.authorize({
        provider: OAuthProviderName.GOOGLE,
      });

      expect(result).toEqual({ authorizationUrl });
      expect(oauthService.getAuthorizationUrl).toHaveBeenCalledWith(
        OAuthProviderName.GOOGLE,
      );
    });
  });

  describe('callback', () => {
    it('should throw BadRequestException if error is present', async () => {
      await expect(
        controller.callback(
          { provider: OAuthProviderName.GOOGLE },
          'code',
          'access_denied',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if code is missing', async () => {
      await expect(
        controller.callback(
          { provider: OAuthProviderName.GOOGLE },
          '',
          undefined,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return access token on successful callback', async () => {
      const accessTokenResponse = { accessToken: 'jwt-token' };

      oauthService.handleOAuthCallback.mockResolvedValue(accessTokenResponse);

      const result = await controller.callback(
        { provider: OAuthProviderName.GOOGLE },
        'valid_code',
      );

      expect(result).toEqual(accessTokenResponse);
      expect(oauthService.handleOAuthCallback).toHaveBeenCalledWith(
        OAuthProviderName.GOOGLE,
        'valid_code',
      );
    });
  });

  describe('unlinkOAuthAccount', () => {
    it('should unlink oauth account for current user', async () => {
      const user: ITokenUser = {
        userId: '507f1f77bcf86cd799439011',
        username: 'test123',
        isSuperUser: false,
      };

      const deleteResult: DeleteResult = {
        acknowledged: true,
        deletedCount: 1,
      };

      oauthService.unlinkOAuthAccount.mockResolvedValue(deleteResult);

      const result = await controller.unlinkOAuthAccount(user, {
        provider: OAuthProviderName.GOOGLE,
      });

      expect(result).toEqual(deleteResult);
      expect(oauthService.unlinkOAuthAccount).toHaveBeenCalledWith(
        user.userId,
        OAuthProviderName.GOOGLE,
      );
    });
  });
});
