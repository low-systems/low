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
const index_1 = require("../../index");
class FirebaseAuthDoer extends index_1.Doer {
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const [name, serviceAccount] of Object.entries(this.secrets)) {
                const exists = !!firebase_admin_1.default.apps.find((app) => (app === null || app === void 0 ? void 0 : app.name) === name);
                //TODO Instead of skipping initialisation, we need to delete and reinitialise the app
                if (!exists) {
                    firebase_admin_1.default.initializeApp({
                        credential: firebase_admin_1.default.credential.cert(serviceAccount)
                    }, name);
                }
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
                    const createCustomTokenResult = yield app.auth().createCustomToken(coreConfig.uid, coreConfig.developerClaims);
                    return createCustomTokenResult;
                case ('createUser'):
                    const createUserResult = yield app.auth().createUser(coreConfig.properties);
                    return createUserResult;
                case ('deleteUser'):
                    yield app.auth().deleteUser(coreConfig.uid);
                    return true;
                case ('deleteUsers'):
                    const deleteUsersResult = yield app.auth().deleteUsers(coreConfig.uids);
                    return deleteUsersResult;
                case ('getUser'):
                    const getUserResult = yield app.auth().getUser(coreConfig.uid);
                    return getUserResult;
                case ('getUserByEmail'):
                    const getUserByEmailResult = yield app.auth().getUserByEmail(coreConfig.email);
                    return getUserByEmailResult;
                case ('getUserByPhoneNumber'):
                    const getUserByPhoneNumberResult = yield app.auth().getUserByPhoneNumber(coreConfig.phoneNumber);
                    return getUserByPhoneNumberResult;
                case ('getUsers'):
                    const getUsersResult = yield app.auth().getUsers(coreConfig.identifiers);
                    return getUsersResult;
                case ('listUsers'):
                    const listUsersResult = yield app.auth().listUsers(coreConfig.maxResults, coreConfig.pageToken);
                    return listUsersResult;
                case ('updateUser'):
                    const updateUserResult = yield app.auth().updateUser(coreConfig.uid, coreConfig.properties);
                    return updateUserResult;
                case ('verifyIdToken'):
                    const verifyIdTokenResult = yield app.auth().verifyIdToken(coreConfig.idToken, coreConfig.checkRevoked);
                    return verifyIdTokenResult;
                case ('setCustomUserClaims'):
                    yield app.auth().setCustomUserClaims(coreConfig.uid, coreConfig.customUserClaims);
                    return true;
                case ('revokeRefreshTokens'):
                    yield app.auth().revokeRefreshTokens(coreConfig.uid);
                    return true;
                case ('importUsers'):
                    const importUsersResult = yield app.auth().importUsers(coreConfig.users, coreConfig.options);
                    return importUsersResult;
                case ('createSessionCookie'):
                    const createSessionCookieResult = yield app.auth().createSessionCookie(coreConfig.idToken, coreConfig.sessionCookieOptions);
                    return createSessionCookieResult;
                case ('verifySessionCookie'):
                    const verifySessionCookieResult = yield app.auth().verifySessionCookie(coreConfig.sessionCookie, coreConfig.checkForRevocation);
                    return verifySessionCookieResult;
                case ('generatePasswordResetLink'):
                    const generatePasswordResetLinkResult = yield app.auth().generatePasswordResetLink(coreConfig.email, coreConfig.actionCodeSettings);
                    return generatePasswordResetLinkResult;
                case ('generateEmailVerificationLink'):
                    const generateEmailVerificationLinkResult = yield app.auth().generateEmailVerificationLink(coreConfig.email, coreConfig.actionCodeSettings);
                    return generateEmailVerificationLinkResult;
                case ('generateSignInWithEmailLink'):
                    const generateSignInWithEmailLinkResult = yield app.auth().generateSignInWithEmailLink(coreConfig.email, coreConfig.actionCodeSettings);
                    return generateSignInWithEmailLinkResult;
                case ('listProviderConfigs'):
                    const listProviderConfigsResult = yield app.auth().listProviderConfigs(coreConfig.options);
                    return listProviderConfigsResult;
                case ('getProviderConfig'):
                    const getProviderConfigResult = yield app.auth().getProviderConfig(coreConfig.providerId);
                    return getProviderConfigResult;
                case ('deleteProviderConfig'):
                    yield app.auth().deleteProviderConfig(coreConfig.providerId);
                    return true;
                case ('updateProviderConfig'):
                    const updateProviderConfigResult = yield app.auth().updateProviderConfig(coreConfig.providerId, coreConfig.updateConfig);
                    return updateProviderConfigResult;
                case ('createProviderConfig'):
                    const createProviderConfigResult = yield app.auth().createProviderConfig(coreConfig.config);
                    return createProviderConfigResult;
            }
        });
    }
}
exports.FirebaseAuthDoer = FirebaseAuthDoer;
//# sourceMappingURL=firebase-auth-doer.js.map