import { JWTOptions, JWT } from 'google-auth-library';

import { StoredCredential, CredentialConfig } from './google-apis-doer';

export class StoredJwtCredential implements StoredCredential {
  private credential?: JWT;

  constructor(public name: string, public config: JwtCredentialConfig) { }

  async getCredential() {
    const now = +new Date();

    if (!this.credential || (this.credential.credentials && this.credential.credentials.expiry_date && this.credential.credentials.expiry_date < now)) {
      const jwtClient = new JWT(this.config.options);
      const credential = await jwtClient.authorize();
      jwtClient.setCredentials(credential);
      this.credential = jwtClient;
    }

    return this.credential;
  }
}

export interface JwtCredentialConfig extends CredentialConfig {
  type: 'JWT';
  options: JWTOptions;
}