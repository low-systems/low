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
exports.StripeDoer = void 0;
const stripe_1 = require("stripe");
const low_1 = require("low");
class StripeDoer extends low_1.Doer {
    constructor() {
        super(...arguments);
        this.clients = {};
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const [name, keyPair] of Object.entries(this.secrets)) {
                this.clients[name] = new stripe_1.Stripe(keyPair.secret_key, this.config[name] || {});
            }
        });
    }
    main(context, taskConfig, config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(config.client in this.clients)) {
                throw new Error(`No stripe client called '${config.client}'`);
            }
            const stripe = this.clients[config.client];
            const method = dot.pick(config.path, stripe);
            if (typeof method !== 'function') {
                if (!config.justReturn) {
                    throw new Error(`Stripe.${config.path} is not a function`);
                }
                else {
                    return method;
                }
            }
            const args = config.args || [];
            const isAsync = typeof config.isAsync === 'boolean' ? config.isAsync : method.constructor.name === 'AsyncFunction';
            if (isAsync) {
                return yield method(...args);
            }
            else {
                return method(...args);
            }
        });
    }
}
exports.StripeDoer = StripeDoer;
//# sourceMappingURL=stripe-doer.js.map