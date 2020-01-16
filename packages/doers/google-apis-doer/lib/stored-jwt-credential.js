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
Object.defineProperty(exports, "__esModule", { value: true });
const google_auth_library_1 = require("google-auth-library");
class StoredJwtCredential {
    constructor(name, config) {
        this.name = name;
        this.config = config;
    }
    getCredential() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = +new Date();
            if (!this.credential || (this.credential.credentials && this.credential.credentials.expiry_date && this.credential.credentials.expiry_date < now)) {
                const jwtClient = new google_auth_library_1.JWT(this.config.options);
                const credential = yield jwtClient.authorize();
                jwtClient.setCredentials(credential);
                this.credential = jwtClient;
            }
            return this.credential;
        });
    }
}
exports.StoredJwtCredential = StoredJwtCredential;
//# sourceMappingURL=stored-jwt-credential.js.map