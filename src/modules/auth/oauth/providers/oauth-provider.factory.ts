import { Injectable, NotFoundException } from '@nestjs/common';
import { OAuthProviderInterface } from '../interfaces';
import { GoogleOAuthProvider } from './google-oauth.provider';
import { OAuthProviderName } from '../enums';

@Injectable()
export class OAuthProviderFactory {
  private providers = new Map<OAuthProviderName, OAuthProviderInterface>();

  constructor(private googleProvider: GoogleOAuthProvider) {
    this.registerProvider(OAuthProviderName.GOOGLE, this.googleProvider);
  }

  registerProvider(
    name: OAuthProviderName,
    provider: OAuthProviderInterface,
  ): void {
    this.providers.set(name, provider);
  }

  getProvider(name: OAuthProviderName): OAuthProviderInterface {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new NotFoundException(`OAuth provider ${name} not found`);
    }
    return provider;
  }

  getSupportedProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}
