import Firebase from 'firebase-admin';

export type FirebaseAuthMethodParams = {
  createCustomToken: {
    uid: string;
    developerClaims?: object;
  };
  createUser: {
    properties: Firebase.auth.CreateRequest;
  };
  deleteUser: {
    uid: string;
  };
  deleteUsers: {
    uids: string[];
  };
  getUser: {
    uid: string;
  };
  getUserByEmail: {
    email: string;
  };
  getUserByPhoneNumber: {
    phoneNumber: string;
  };
  getUsers: {
    identifiers: UserIdentifier[];
  };
  listUsers: {
    maxResults?: number;
    pageToken?: string;
  };
  updateUser: {
    uid: string;
    properties: Firebase.auth.UpdateRequest;
  };
  verifyIdToken: {
    idToken: string;
    checkRevoked?: boolean;
  };
  setCustomUserClaims: {
    uid: string;
    customUserClaims: object | null;
  };
  revokeRefreshTokens: {
    uid: string;
  };
  importUsers: {
    users: Firebase.auth.UserImportRecord[];
    options?: Firebase.auth.UserImportOptions;
  };
  createSessionCookie: {
    idToken: string;
    sessionCookieOptions: Firebase.auth.SessionCookieOptions;
  };
  verifySessionCookie: {
    sessionCookie: string;
    checkForRevocation?: boolean;
  };
  generatePasswordResetLink: {
    email: string;
    actionCodeSettings?: Firebase.auth.ActionCodeSettings;
  };
  generateEmailVerificationLink: {
    email: string;
    actionCodeSettings?: Firebase.auth.ActionCodeSettings;
  };
  generateSignInWithEmailLink: {
    email: string;
    actionCodeSettings?: Firebase.auth.ActionCodeSettings;
  };
  listProviderConfigs: {
    options: Firebase.auth.AuthProviderConfigFilter;
  };
  getProviderConfig: {
    providerId: string;
  };
  deleteProviderConfig: {
    providerId: string;
  };
  updateProviderConfig: {
    providerId: string;
    updateConfig: Firebase.auth.UpdateAuthProviderRequest;
  };
  createProviderConfig: {
    config: Firebase.auth.AuthProviderConfig;
  };
}

/**
 * Used for looking up an account by uid.
 *
 * See auth.getUsers()
 */
interface UidIdentifier {
  uid: string;
}

/**
 * Used for looking up an account by email.
 *
 * See auth.getUsers()
 */
interface EmailIdentifier {
  email: string;
}

/**
 * Used for looking up an account by phone number.
 *
 * See auth.getUsers()
 */
interface PhoneIdentifier {
  phoneNumber: string;
}

/**
 * Used for looking up an account by federated provider.
 *
 * See auth.getUsers()
 */
interface ProviderIdentifier {
  providerId: string;
  providerUid: string;
}

/**
 * Identifies a user to be looked up.
 */
type UserIdentifier = UidIdentifier | EmailIdentifier | PhoneIdentifier | ProviderIdentifier;
