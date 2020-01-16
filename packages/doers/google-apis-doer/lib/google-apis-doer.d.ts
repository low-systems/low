import { GlobalOptions } from 'googleapis-common';
import { OAuth2Client } from 'google-auth-library';
import { Doer, TaskConfig, ConnectorContext, IMap } from 'low';
import { JwtCredentialConfig } from './stored-jwt-credential';
import { ApiKeyCredentialConfig } from './stored-api-key-credential';
export declare class GoogleApisDoer extends Doer<GoogleApisConfig, GoogleApisSecretsConfig> {
    credentials: IMap<StoredCredential>;
    setup(): Promise<void>;
    main(context: ConnectorContext<any>, taskConfig: TaskConfig, coreConfig: GoogleApisTaskConfig): Promise<any>;
}
export interface StoredCredential {
    name: string;
    config: any;
    getCredential(): Promise<string | OAuth2Client>;
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
    apiOptions: {
        version: string;
        [key: string]: any;
    };
    credential?: string;
    arguments?: any[];
}
