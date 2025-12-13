export interface OAuthProviderConfig {
  clientId: string;
  clientSecret: string;
  callbackURL: string;
  scope: string[];
}
