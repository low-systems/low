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
require('source-map-support').install();
const request_doer_1 = require("@low-systems/request-doer");
const http_connector_1 = require("@low-systems/http-connector");
const handlebars_renderer_1 = require("@low-systems/handlebars-renderer");
const low_1 = require("low");
const Config = require('../configuration/main.json');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(Config);
        process.env.SECRETS = JSON.stringify(Config.secrets);
        const modules = {
            connectors: [new http_connector_1.HttpConnector(),],
            doers: [new request_doer_1.RequestDoer(),],
            renderers: [new handlebars_renderer_1.HandlebarsRenderer(),]
        };
        const environment = new low_1.Environment(modules, Config.tasks, Config.environment);
        yield environment.init();
    });
}
exports.main = main;
main().then().catch(err => console.error);
//# sourceMappingURL=index.js.map