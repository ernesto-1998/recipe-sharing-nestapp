import { Module } from '@nestjs/common';
import { OAuthController } from './controllers/oauth/oauth.controller';
import { OAuthService } from './services/oauth.service';
import { AuthModule } from '../auth.module';
import { UserModule } from 'src/modules/user/user.module';
import { OAuthProviderFactory } from './providers';
import { GoogleOAuthProvider } from './providers';
import { MongooseModule } from '@nestjs/mongoose';
import {
  OAuthAccount,
  OAuthAccountSchema,
} from './schemas/oauth-account.schema';
import { OAuthAccountRepository } from './repositories/oauth.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OAuthAccount.name, schema: OAuthAccountSchema },
    ]),
    AuthModule,
    UserModule,
  ],
  controllers: [OAuthController],
  providers: [
    OAuthService,
    GoogleOAuthProvider,
    OAuthProviderFactory,
    OAuthAccountRepository,
  ],
})
export class OAuthModule {}
