import { google as Google } from 'googleapis';
import { GlobalOptions } from 'googleapis-common';
import { OAuth2Client } from 'google-auth-library';

import { Doer, TaskConfig, ConnectorContext, IMap, ObjectCompiler } from 'low';
import { JwtCredentialConfig, StoredJwtCredential } from './stored-jwt-credential';
import { ApiKeyCredentialConfig, StoredApiKeyCredential } from './stored-api-key-credential';

export class GoogleApisDoer extends Doer<GoogleApisConfig, GoogleApisSecretsConfig> {
  credentials: IMap<StoredCredential> = {};

  async setup() {
    if (this.config.globalOptions) {
      Google.options(this.config.globalOptions);
    }

    for (const [name, config] of Object.entries(this.secrets.credentials)) {
      switch (config.type) {
        case ('JWT'):
          this.credentials[name] = new StoredJwtCredential(name, config);
          break;
        case ('API Key'):
          this.credentials[name] = new StoredApiKeyCredential(name, config);
          break;
      }
    }
  }

  async main(context: ConnectorContext<any>, taskConfig: TaskConfig, coreConfig: GoogleApisTaskConfig): Promise<any> {
    const apiOptions = coreConfig.apiOptions;

    if (coreConfig.credential) {
      const credential = this.credentials[coreConfig.credential];
      apiOptions.auth = await credential.getCredential();
    }

    const api = (Google as any)[coreConfig.api](apiOptions);
    const method = ObjectCompiler.objectPath(api, coreConfig.method);
    const response = await method.apply(api, coreConfig.arguments);
    return response;
  }
}

export interface StoredCredential {
  name: string;
  config: any;
  getCredential (): Promise<string | OAuth2Client>;
}


export interface GoogleApisConfig {
  globalOptions?: GlobalOptions;
}

export interface GoogleApisSecretsConfig {
  credentials: IMap<JwtCredentialConfig | ApiKeyCredentialConfig>;
}

export interface CredentialConfig {
  type: 'JWT' | 'API Key';
}

export interface GoogleApisTaskConfig {
  method: string;
  api: string;
  apiOptions: { version: string, [key: string]: any };
  credential?: string;
  arguments?: any[];
}