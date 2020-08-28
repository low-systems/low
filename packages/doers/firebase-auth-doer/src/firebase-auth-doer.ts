import Firebase from 'firebase-admin';

import { Doer, TaskConfig, ConnectorContext, IMap } from 'low';

export class FirebaseAuthDoer extends Doer<any, IMap<Firebase.ServiceAccount>> {
  async setup() {
    for (const [name, serviceAccount] of Object.entries(this.secrets)) {
      const exists = !!Firebase.apps.find((app) => app?.name === name);
      //TODO Instead of skipping initialisation, we need to delete and reinitialise the app
      if (!exists) {
        Firebase.initializeApp({
          credential: Firebase.credential.cert(serviceAccount)
        }, name);
      }
    }
  }

  async main(context: ConnectorContext<any>, taskConfig: TaskConfig, coreConfig: FirebaseAuthConfig): Promise<any> {
    const app = Firebase.app(coreConfig.app);

    if (!app) {
      throw new Error(`Invalid Firebase app name '${coreConfig.app}'`);
    }

    switch (coreConfig.method) {
      case ('createCustomToken'):
        const createCustomTokenResult = await Firebase.auth().createCustomToken(coreConfig.uid, coreConfig.developerClaims);
        return createCustomTokenResult;
      case ('createUser'):
        const createUserResult = await Firebase.auth().createUser(coreConfig.properties);
        return createUserResult;
      case ('deleteUser'):
        await Firebase.auth().deleteUser(coreConfig.uid);
        return true;
      case ('deleteUsers'):
        const deleteUsersResult = await Firebase.auth().deleteUsers(coreConfig.uids);
        return deleteUsersResult;
      case ('getUser'):
        const getUserResult = await Firebase.auth().getUser(coreConfig.uid);
        return getUserResult;
      case ('getUserByEmail'):
        const getUserByEmailResult = await Firebase.auth().getUserByEmail(coreConfig.email);
        return getUserByEmailResult;
      case ('getUserByPhoneNumber'):
        const getUserByPhoneNumberResult = await Firebase.auth().getUserByPhoneNumber(coreConfig.phoneNumber);
        return getUserByPhoneNumberResult;
      case ('getUsers'):
        const getUsersResult = await Firebase.auth().getUsers(coreConfig.identifiers);
        return getUsersResult;
      case ('listUsers'):
        const listUsersResult = await Firebase.auth().listUsers(coreConfig.maxResults, coreConfig.pageToken);
        return listUsersResult;
      case ('updateUser'):
        const updateUserResult = await Firebase.auth().updateUser(coreConfig.uid, coreConfig.properties);
        return updateUserResult;
      case ('verifyIdToken'):
        const verifyIdTokenResult = await Firebase.auth().verifyIdToken(coreConfig.idToken, coreConfig.checkRevoked);
        return verifyIdTokenResult;
      case ('setCustomUserClaims'):
        await Firebase.auth().setCustomUserClaims(coreConfig.uid, coreConfig.customUserClaims);
        return true;
      case ('revokeRefreshTokens'):
        await Firebase.auth().revokeRefreshTokens(coreConfig.uid);
        return true;
      case ('importUsers'):
        const importUsersResult = await Firebase.auth().importUsers(coreConfig.users, coreConfig.options);
        return importUsersResult;
      case ('createSessionCookie'):
        const createSessionCookieResult = await Firebase.auth().createSessionCookie(coreConfig.idToken, coreConfig.sessionCookieOptions);
        return createSessionCookieResult;
      case ('verifySessionCookie'):
        const verifySessionCookieResult = await Firebase.auth().verifySessionCookie(coreConfig.sessionCookie, coreConfig.checkForRevocation);
        return verifySessionCookieResult;
      case ('generatePasswordResetLink'):
        const generatePasswordResetLinkResult = await Firebase.auth().generatePasswordResetLink(coreConfig.email, coreConfig.actionCodeSettings);
        return generatePasswordResetLinkResult;
      case ('generateEmailVerificationLink'):
        const generateEmailVerificationLinkResult = await Firebase.auth().generateEmailVerificationLink(coreConfig.email, coreConfig.actionCodeSettings);
        return generateEmailVerificationLinkResult;
      case ('generateSignInWithEmailLink'):
        const generateSignInWithEmailLinkResult = await Firebase.auth().generateSignInWithEmailLink(coreConfig.email, coreConfig.actionCodeSettings);
        return generateSignInWithEmailLinkResult;
      case ('listProviderConfigs'):
        const listProviderConfigsResult = await Firebase.auth().listProviderConfigs(coreConfig.options);
        return listProviderConfigsResult;
      case ('getProviderConfig'):
        const getProviderConfigResult = await Firebase.auth().getProviderConfig(coreConfig.providerId);
        return getProviderConfigResult;
      case ('deleteProviderConfig'):
        await Firebase.auth().deleteProviderConfig(coreConfig.providerId);
        return true;
      case ('updateProviderConfig'):
        const updateProviderConfigResult = await Firebase.auth().updateProviderConfig(coreConfig.providerId, coreConfig.updateConfig);
        return updateProviderConfigResult;
      case ('createProviderConfig'):
        const createProviderConfigResult = await Firebase.auth().createProviderConfig(coreConfig.config);
        return createProviderConfigResult;
    }
  }
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

export type FirebaseAuthConfig = FirebaseAuthCreateCustomTokenCall | FirebaseAuthCreateUserCall | FirebaseAuthDeleteUserCall | FirebaseAuthDeleteUsersCall | FirebaseAuthGetUserCall | FirebaseAuthGetUserByEmailCall | FirebaseAuthGetUserByPhoneNumberCall | FirebaseAuthGetUsersCall | FirebaseAuthListUsersCall | FirebaseAuthUpdateUserCall | FirebaseAuthVerifyIdTokenCall | FirebaseAuthSetCustomUserClaimsCall | FirebaseAuthRevokeRefreshTokensCall | FirebaseAuthImportUsersCall | FirebaseAuthCreateSessionCookieCall | FirebaseAuthVerifySessionCookieCall | FirebaseAuthGeneratePasswordResetLinkCall | FirebaseAuthGenerateEmailVerificationLinkCall | FirebaseAuthGenerateSignInWithEmailLinkCall | FirebaseAuthListProviderConfigsCall | FirebaseAuthGetProviderConfigCall | FirebaseAuthDeleteProviderConfigCall | FirebaseAuthUpdateProviderConfigCall | FirebaseAuthCreateProviderConfigCall;

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

type UserIdentifier = UidIdentifier | EmailIdentifier | PhoneIdentifier | ProviderIdentifier;