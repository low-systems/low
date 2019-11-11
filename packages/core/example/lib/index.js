"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('source-map-support').install();
const request_doer_1 = require("@low-systems/request-doer");
const http_connector_1 = require("@low-systems/http-connector");
const handlebars_renderer_1 = require("@low-systems/handlebars-renderer");
const low_1 = require("low");
const Config = require('../configuration/main.json');
async function main() {
    console.log(Config);
    process.env.SECRETS = JSON.stringify(Config.secrets);
    const modules = {
        connectors: [new http_connector_1.HttpConnector(),],
        doers: [new request_doer_1.RequestDoer(),],
        renderers: [new handlebars_renderer_1.HandlebarsRenderer(),]
    };
    const environment = new low_1.Environment(modules, Config.tasks, Config.environment);
    await environment.init();
}
exports.main = main;
main().then().catch(err => console.error);
//# sourceMappingURL=index.js.map