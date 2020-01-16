import { StoredCredential, CredentialConfig } from './google-apis-doer';
export declare class StoredApiKeyCredential implements StoredCredential {
    name: string;
    config: ApiKeyCredentialConfig;
    constructor(name: string, config: ApiKeyCredentialConfig);
    getCredential(): Promise<string>;
}
export interface ApiKeyCredentialConfig extends CredentialConfig {
    type: 'API Key';
    apiKey: string;
}
