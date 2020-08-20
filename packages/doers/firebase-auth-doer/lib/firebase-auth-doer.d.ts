import Firebase from 'firebase-admin';
import { Doer, TaskConfig, ConnectorContext, IMap } from 'low';
export declare class FirebaseAuthDoer extends Doer<any, IMap<Firebase.ServiceAccount>> {
    setup(): Promise<void>;
    main(context: ConnectorContext<any>, taskConfig: TaskConfig, coreConfig: FirebaseAuthConfig): Promise<any>;
}
export interface FirebaseAuthCall {
    method: string;
    app: string;
}
export interface FirebaseAuthCreateCustomTokenCall extends FirebaseAuthCall {
    method: 'createCustomToken';
    uid: string;
    developerClaims?: object;
}
export interface FirebaseAuthCreateUserCall extends FirebaseAuthCall {
    method: 'createUser';
    properties: Firebase.auth.CreateRequest;
}
export interface FirebaseAuthDeleteUserCall extends FirebaseAuthCall {
    method: 'deleteUser';
    uid: string;
}
export interface FirebaseAuthDeleteUsersCall extends FirebaseAuthCall {
    method: 'deleteUsers';
    uids: string[];
}
export interface FirebaseAuthGetUserCall extends FirebaseAuthCall {
    method: 'getUser';
    uid: string;
}
export interface FirebaseAuthGetUserByEmailCall extends FirebaseAuthCall {
    method: 'getUserByEmail';
    email: string;
}
export interface FirebaseAuthGetUserByPhoneNumberCall extends FirebaseAuthCall {
    method: 'getUserByPhoneNumber';
    phoneNumber: string;
}
export interface FirebaseAuthGetUsersCall extends FirebaseAuthCall {
    method: 'getUsers';
    identifiers: UserIdentifier[];
}
export interface FirebaseAuthListUsersCall extends FirebaseAuthCall {
    method: 'listUsers';
    maxResults?: number;
    pageToken?: string;
}
export interface FirebaseAuthUpdateUserCall extends FirebaseAuthCall {
    method: 'updateUser';
    uid: string;
    properties: Firebase.auth.UpdateRequest;
}
export interface FirebaseAuthVerifyIdTokenCall extends FirebaseAuthCall {
    method: 'verifyIdToken';
    idToken: string;
    checkRevoked?: boolean;
}
export interface FirebaseAuthSetCustomUserClaimsCall extends FirebaseAuthCall {
    method: 'setCustomUserClaims';
    uid: string;
    customUserClaims: object | null;
}
export interface FirebaseAuthRevokeRefreshTokensCall extends FirebaseAuthCall {
    method: 'revokeRefreshTokens';
    uid: string;
}
export interface FirebaseAuthImportUsersCall extends FirebaseAuthCall {
    method: 'importUsers';
    users: Firebase.auth.UserImportRecord[];
    options?: Firebase.auth.UserImportOptions;
}
export interface FirebaseAuthCreateSessionCookieCall extends FirebaseAuthCall {
    method: 'createSessionCookie';
    idToken: string;
    sessionCookieOptions: Firebase.auth.SessionCookieOptions;
}
export interface FirebaseAuthVerifySessionCookieCall extends FirebaseAuthCall {
    method: 'verifySessionCookie';
    sessionCookie: string;
    checkForRevocation?: boolean;
}
export interface FirebaseAuthGeneratePasswordResetLinkCall extends FirebaseAuthCall {
    method: 'generatePasswordResetLink';
    email: string;
    actionCodeSettings?: Firebase.auth.ActionCodeSettings;
}
export interface FirebaseAuthGenerateEmailVerificationLinkCall extends FirebaseAuthCall {
    method: 'generateEmailVerificationLink';
    email: string;
    actionCodeSettings?: Firebase.auth.ActionCodeSettings;
}
export interface FirebaseAuthGenerateSignInWithEmailLinkCall extends FirebaseAuthCall {
    method: 'generateSignInWithEmailLink';
    email: string;
    actionCodeSettings: Firebase.auth.ActionCodeSettings;
}
export interface FirebaseAuthListProviderConfigsCall extends FirebaseAuthCall {
    method: 'listProviderConfigs';
    options: Firebase.auth.AuthProviderConfigFilter;
}
export interface FirebaseAuthGetProviderConfigCall extends FirebaseAuthCall {
    method: 'getProviderConfig';
    providerId: string;
}
export interface FirebaseAuthDeleteProviderConfigCall extends FirebaseAuthCall {
    method: 'deleteProviderConfig';
    providerId: string;
}
export interface FirebaseAuthUpdateProviderConfigCall extends FirebaseAuthCall {
    method: 'updateProviderConfig';
    providerId: string;
    updateConfig: Firebase.auth.UpdateAuthProviderRequest;
}
export interface FirebaseAuthCreateProviderConfigCall extends FirebaseAuthCall {
    method: 'createProviderConfig';
    config: Firebase.auth.AuthProviderConfig;
}
export declare type FirebaseAuthConfig = FirebaseAuthCreateCustomTokenCall | FirebaseAuthCreateUserCall | FirebaseAuthDeleteUserCall | FirebaseAuthDeleteUsersCall | FirebaseAuthGetUserCall | FirebaseAuthGetUserByEmailCall | FirebaseAuthGetUserByPhoneNumberCall | FirebaseAuthGetUsersCall | FirebaseAuthListUsersCall | FirebaseAuthUpdateUserCall | FirebaseAuthVerifyIdTokenCall | FirebaseAuthSetCustomUserClaimsCall | FirebaseAuthRevokeRefreshTokensCall | FirebaseAuthImportUsersCall | FirebaseAuthCreateSessionCookieCall | FirebaseAuthVerifySessionCookieCall | FirebaseAuthGeneratePasswordResetLinkCall | FirebaseAuthGenerateEmailVerificationLinkCall | FirebaseAuthGenerateSignInWithEmailLinkCall | FirebaseAuthListProviderConfigsCall | FirebaseAuthGetProviderConfigCall | FirebaseAuthDeleteProviderConfigCall | FirebaseAuthUpdateProviderConfigCall | FirebaseAuthCreateProviderConfigCall;
interface UidIdentifier {
    uid: string;
}
interface EmailIdentifier {
    email: string;
}
interface PhoneIdentifier {
    phoneNumber: string;
}
interface ProviderIdentifier {
    providerId: string;
    providerUid: string;
}
declare type UserIdentifier = UidIdentifier | EmailIdentifier | PhoneIdentifier | ProviderIdentifier;
export {};
