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
const googleapis_1 = require("googleapis");
const low_1 = require("low");
const stored_jwt_credential_1 = require("./stored-jwt-credential");
const stored_api_key_credential_1 = require("./stored-api-key-credential");
class GoogleApisDoer extends low_1.Doer {
    constructor() {
        super(...arguments);
        this.credentials = {};
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.config.globalOptions) {
                googleapis_1.google.options(this.config.globalOptions);
            }
            for (const [name, config] of Object.entries(this.secrets.credentials)) {
                switch (config.type) {
                    case ('JWT'):
                        this.credentials[name] = new stored_jwt_credential_1.StoredJwtCredential(name, config);
                        break;
                    case ('API Key'):
                        this.credentials[name] = new stored_api_key_credential_1.StoredApiKeyCredential(name, config);
                        break;
                }
            }
        });
    }
    main(context, taskConfig, coreConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiOptions = coreConfig.apiOptions;
            if (coreConfig.credential) {
                const credential = this.credentials[coreConfig.credential];
                apiOptions.auth = yield credential.getCredential();
            }
            const api = googleapis_1.google[coreConfig.api](apiOptions);
            const method = low_1.ObjectCompiler.objectPath(api, coreConfig.method);
            const response = yield method.apply(api, coreConfig.arguments);
            return response;
        });
    }
}
exports.GoogleApisDoer = GoogleApisDoer;
//# sourceMappingURL=google-apis-doer.js.map