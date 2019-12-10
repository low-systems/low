import { StoredCredential, CredentialConfig } from './google-apis-doer';

export class StoredApiKeyCredential implements StoredCredential {
  constructor (public name: string, public config: ApiKeyCredentialConfig) { }

  async getCredential() {
    return this.config.apiKey;
  }
}

export interface ApiKeyCredentialConfig extends CredentialConfig {
  type: 'API Key';
  apiKey: string;
}