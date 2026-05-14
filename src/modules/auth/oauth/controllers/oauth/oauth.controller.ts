import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { OAuthProviderNameDto, AccessTokenDto } from '../../dto';
import { OAuthService } from '../../services/oauth.service';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Public } from 'src/common/decorators';
import { CurrentUser } from 'src/modules/auth/decorators';
import type { ITokenUser } from 'src/modules/auth/interfaces';
import { DeleteResult } from 'mongoose';

@Controller({ version: '1', path: 'oauth' })
export class OAuthController {
  constructor(private oauthService: OAuthService) {}

  @Public()
  @ApiOperation({
    summary: 'Get authorization URL for an OAuth provider',
    description:
      'Returns the URL where the user should be redirected to begin the OAuth authorization flow.',
  })
  @ApiParam({
    name: 'provider',
    description: 'OAuth provider name',
    enum: ['google'],
    example: 'google',
  })
  @ApiOkResponse({
    description: 'Successfully generated authorization URL.',
    schema: {
      example: {
        authorizationUrl:
          'https://accounts.google.com/o/oauth2/v2/auth?client_id=123&redirect_uri=...',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid provider name.',
  })
  @Get(':provider')
  async authorize(@Param() providerName: OAuthProviderNameDto) {
    return {
      authorizationUrl: await this.oauthService.getAuthorizationUrl(
        providerName.provider,
      ),
    };
  }

  @Public()
  @ApiOperation({
    summary: 'OAuth callback handler',
    description:
      'Receives the authorization code after a successful login with an OAuth provider and returns an access token.',
  })
  @ApiParam({
    name: 'provider',
    description: 'OAuth provider name',
    enum: ['google'],
    example: 'google',
  })
  @ApiQuery({
    name: 'code',
    required: true,
    description: 'Authorization code returned by the OAuth provider',
    example: '4/0AbCdEfGhIjKlMnOpQrStUvWxYz123456789',
  })
  @ApiQuery({
    name: 'error',
    required: false,
    description: 'Error returned by the OAuth provider (if any)',
    example: 'access_denied',
  })
  @ApiOkResponse({
    description: 'OAuth authentication successful, returns an access token.',
    type: AccessTokenDto,
  })
  @ApiBadRequestResponse({
    description:
      'Missing or invalid OAuth code, or the provider returned an error.',
  })
  @Get(':provider/callback')
  async callback(
    @Param() providerName: OAuthProviderNameDto,
    @Query('code') code: string,
    @Query('error') error?: string,
  ): Promise<AccessTokenDto> {
    if (error) {
      throw new BadRequestException('OAuth authorization failed');
    }

    if (!code) {
      throw new BadRequestException('Authorization code missing');
    }

    return await this.oauthService.handleOAuthCallback(
      providerName.provider,
      code,
    );
  }

  @ApiOperation({
    summary: 'Delete an OAuth account from user',
    description:
      'Recives a provider name and using the current logged userId, it deletes the OAuthAccounts providers from this user.',
  })
  @ApiOkResponse({
    description: 'OAuth account unlinked successfully.',
    schema: {
      example: {
        acknowledged: true,
        deletedCount: 1,
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'User not found or cannot unlink OAuth account from a non-OAuth user.',
  })
  @Delete(':provider/unlink')
  async unlinkOAuthAccount(
    @CurrentUser() user: ITokenUser,
    @Param() providerName: OAuthProviderNameDto,
  ): Promise<DeleteResult> {
    return await this.oauthService.unlinkOAuthAccount(
      user.userId,
      providerName.provider,
    );
  }
}
