import { JWTOptions, JWT } from 'google-auth-library';
import { StoredCredential, CredentialConfig } from './google-apis-doer';
export declare class StoredJwtCredential implements StoredCredential {
    name: string;
    config: JwtCredentialConfig;
    private credential?;
    constructor(name: string, config: JwtCredentialConfig);
    getCredential(): Promise<JWT>;
}
export interface JwtCredentialConfig extends CredentialConfig {
    type: 'JWT';
    options: JWTOptions;
}
