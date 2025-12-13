import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from 'src/modules/user/services/user.service';
import { OAuthProviderFactory } from '../providers';
import { AuthService } from '../../services/auth.service';
import { OAuthProviderName } from '../enums';
import { AccessTokenDto } from '../dto';
import { OAuthUser } from '../types';
import { ResponseUserDto } from 'src/modules/user/dto';
import { UserRolesLevel } from 'src/common/enums';
import { OAuthAccountRepository } from '../repositories/oauth.repository';
import { Mapper } from 'src/common/utils/mapper';
import { DeleteResult } from 'mongoose';

@Injectable()
export class OAuthService {
  constructor(
    private authService: AuthService,
    private oauthProviderFactory: OAuthProviderFactory,
    private oauthAccountRepository: OAuthAccountRepository,
    private userService: UserService,
  ) {}

  async getAuthorizationUrl(provider: OAuthProviderName): Promise<string> {
    return this.oauthProviderFactory.getProvider(provider).authorize();
  }

  async handleOAuthCallback(
    providerName: OAuthProviderName,
    code: string,
  ): Promise<AccessTokenDto> {
    const provider = this.oauthProviderFactory.getProvider(providerName);
    const oauthUser = await provider.callback(code);
    const user = await this.handleOAuthLogin(providerName, oauthUser);
    const tokenUser = {
      userId: user._id,
      username: user.username,
      isSuperUser: user.role === UserRolesLevel.SUPERUSER,
    };
    return this.authService.logIn(tokenUser);
  }

  private async handleOAuthLogin(
    provider: OAuthProviderName,
    oauthUser: OAuthUser,
  ): Promise<ResponseUserDto> {
    const oauthAccount = await this.oauthAccountRepository.findOneByProvider(
      provider,
      oauthUser.id,
    );
    if (oauthAccount?.user) {
      return Mapper.toResponse(ResponseUserDto, oauthAccount.user);
    }
    let user: ResponseUserDto;
    try {
      user = await this.userService.findByEmail(oauthUser.email);
      if (!oauthAccount) {
        await this.oauthAccountRepository.create(provider, oauthUser, user);
      }
      if (!user?.isOAuthUser) {
        await this.userService.updateIsOAuthUser(user._id, true);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        user = await this.userService.createFromOAuthUser(oauthUser);
        if (!oauthAccount) {
          await this.oauthAccountRepository.create(provider, oauthUser, user);
        }
        return user;
      }
      return Promise.reject(error);
    }
  }

  async unlinkOAuthAccount(
    userId: string,
    provider: OAuthProviderName,
  ): Promise<DeleteResult> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found.');
    }
    if (!user.isOAuthUser) {
      throw new BadRequestException(
        'Cannot unlink OAuth account from a non-OAuth user.',
      );
    }
    return this.oauthAccountRepository.unlinkOAuthAccount(userId, provider);
  }
}
