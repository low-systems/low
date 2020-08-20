"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseAuthDoer = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const low_1 = require("low");
class FirebaseAuthDoer extends low_1.Doer {
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const [name, serviceAccount] of Object.entries(this.secrets)) {
                firebase_admin_1.default.initializeApp({
                    credential: firebase_admin_1.default.credential.cert(serviceAccount)
                }, name);
            }
        });
    }
    main(context, taskConfig, coreConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const app = firebase_admin_1.default.app(coreConfig.app);
            if (!app) {
                throw new Error(`Invalid Firebase app name '${coreConfig.app}'`);
            }
            switch (coreConfig.method) {
                case ('createCustomToken'):
                    const createCustomTokenResult = yield firebase_admin_1.default.auth().createCustomToken(coreConfig.uid, coreConfig.developerClaims);
                    return createCustomTokenResult;
                case ('createUser'):
                    const createUserResult = yield firebase_admin_1.default.auth().createUser(coreConfig.properties);
                    return createUserResult;
                case ('deleteUser'):
                    yield firebase_admin_1.default.auth().deleteUser(coreConfig.uid);
                    return true;
                case ('deleteUsers'):
                    const deleteUsersResult = yield firebase_admin_1.default.auth().deleteUsers(coreConfig.uids);
                    return deleteUsersResult;
                case ('getUser'):
                    const getUserResult = yield firebase_admin_1.default.auth().getUser(coreConfig.uid);
                    return getUserResult;
                case ('getUserByEmail'):
                    const getUserByEmailResult = yield firebase_admin_1.default.auth().getUserByEmail(coreConfig.email);
                    return getUserByEmailResult;
                case ('getUserByPhoneNumber'):
                    const getUserByPhoneNumberResult = yield firebase_admin_1.default.auth().getUserByPhoneNumber(coreConfig.phoneNumber);
                    return getUserByPhoneNumberResult;
                case ('getUsers'):
                    const getUsersResult = yield firebase_admin_1.default.auth().getUsers(coreConfig.identifiers);
                    return getUsersResult;
                case ('listUsers'):
                    const listUsersResult = yield firebase_admin_1.default.auth().listUsers(coreConfig.maxResults, coreConfig.pageToken);
                    return listUsersResult;
                case ('updateUser'):
                    const updateUserResult = yield firebase_admin_1.default.auth().updateUser(coreConfig.uid, coreConfig.properties);
                    return updateUserResult;
                case ('verifyIdToken'):
                    const verifyIdTokenResult = yield firebase_admin_1.default.auth().verifyIdToken(coreConfig.idToken, coreConfig.checkRevoked);
                    return verifyIdTokenResult;
                case ('setCustomUserClaims'):
                    yield firebase_admin_1.default.auth().setCustomUserClaims(coreConfig.uid, coreConfig.customUserClaims);
                    return true;
                case ('revokeRefreshTokens'):
                    yield firebase_admin_1.default.auth().revokeRefreshTokens(coreConfig.uid);
                    return true;
                case ('importUsers'):
                    const importUsersResult = yield firebase_admin_1.default.auth().importUsers(coreConfig.users, coreConfig.options);
                    return importUsersResult;
                case ('createSessionCookie'):
                    const createSessionCookieResult = yield firebase_admin_1.default.auth().createSessionCookie(coreConfig.idToken, coreConfig.sessionCookieOptions);
                    return createSessionCookieResult;
                case ('verifySessionCookie'):
                    const verifySessionCookieResult = yield firebase_admin_1.default.auth().verifySessionCookie(coreConfig.sessionCookie, coreConfig.checkForRevocation);
                    return verifySessionCookieResult;
                case ('generatePasswordResetLink'):
                    const generatePasswordResetLinkResult = yield firebase_admin_1.default.auth().generatePasswordResetLink(coreConfig.email, coreConfig.actionCodeSettings);
                    return generatePasswordResetLinkResult;
                case ('generateEmailVerificationLink'):
                    const generateEmailVerificationLinkResult = yield firebase_admin_1.default.auth().generateEmailVerificationLink(coreConfig.email, coreConfig.actionCodeSettings);
                    return generateEmailVerificationLinkResult;
                case ('generateSignInWithEmailLink'):
                    const generateSignInWithEmailLinkResult = yield firebase_admin_1.default.auth().generateSignInWithEmailLink(coreConfig.email, coreConfig.actionCodeSettings);
                    return generateSignInWithEmailLinkResult;
                case ('listProviderConfigs'):
                    const listProviderConfigsResult = yield firebase_admin_1.default.auth().listProviderConfigs(coreConfig.options);
                    return listProviderConfigsResult;
                case ('getProviderConfig'):
                    const getProviderConfigResult = yield firebase_admin_1.default.auth().getProviderConfig(coreConfig.providerId);
                    return getProviderConfigResult;
                case ('deleteProviderConfig'):
                    yield firebase_admin_1.default.auth().deleteProviderConfig(coreConfig.providerId);
                    return true;
                case ('updateProviderConfig'):
                    const updateProviderConfigResult = yield firebase_admin_1.default.auth().updateProviderConfig(coreConfig.providerId, coreConfig.updateConfig);
                    return updateProviderConfigResult;
                case ('createProviderConfig'):
                    const createProviderConfigResult = yield firebase_admin_1.default.auth().createProviderConfig(coreConfig.config);
                    return createProviderConfigResult;
            }
        });
    }
}
exports.FirebaseAuthDoer = FirebaseAuthDoer;
//# sourceMappingURL=firebase-auth-doer.js.map