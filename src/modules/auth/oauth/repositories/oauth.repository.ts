import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, Model } from 'mongoose';
import {
  OAuthAccount,
  OAuthAccountDocument,
  OAuthAccountWithUser,
} from '../schemas/oauth-account.schema';
import { OAuthProviderName } from '../enums';
import { OAuthUser } from '../types/oauth-user.type';
import { ResponseUserDto } from 'src/modules/user/dto';

@Injectable()
export class OAuthAccountRepository {
  constructor(
    @InjectModel(OAuthAccount.name)
    private oauthAccountModel: Model<OAuthAccountDocument>,
  ) {}

  findOneByProvider(
    provider: OAuthProviderName,
    providerId: string,
  ): Promise<OAuthAccountWithUser | null> {
    return this.oauthAccountModel
      .findOne({ provider, providerId })
      .populate('userId')
      .exec() as Promise<OAuthAccountWithUser | null>;
  }

  findManyByUserId(userId: string) {
    return this.oauthAccountModel.find({ userId }).exec();
  }

  create(
    provider: OAuthProviderName,
    oauthUser: OAuthUser,
    user: ResponseUserDto,
  ) {
    return this.oauthAccountModel.create({
      provider,
      providerId: oauthUser.id,
      email: oauthUser.email,
      userId: user._id,
    });
  }

  unlinkOAuthAccount(
    userId: string,
    provider: OAuthProviderName,
  ): Promise<DeleteResult> {
    return this.oauthAccountModel.deleteMany({ userId, provider }).exec();
  }

  findAccountsByEmail(email: string) {
    return this.oauthAccountModel.find({ email }).exec();
  }

  updateAccountEmail(
    provider: OAuthProviderName,
    providerId: string,
    newEmail: string,
  ) {
    return this.oauthAccountModel.updateMany(
      { provider, providerId },
      { email: newEmail },
    );
  }

  async getAccountStats(userId: string) {
    const accounts = await this.findManyByUserId(userId);

    return {
      totalAccounts: accounts.length,
      providers: accounts.map((a) => a.provider),
    };
  }
}
