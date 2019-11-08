"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('source-map-support').install();
const doer_request_1 = require("@low-systems/doer-request");
const connector_http_1 = require("@low-systems/connector-http");
const renderer_handlebars_1 = require("@low-systems/renderer-handlebars");
const low_1 = require("low");
const Config = require('../configuration/main.json');
(async () => {
    process.env.SECRETS = JSON.stringify(Config.secrets);
    const modules = {
        connectors: [new connector_http_1.ConnectorHttp(),],
        doers: [new doer_request_1.DoerRequest(),],
        renderers: [new renderer_handlebars_1.RendererHandlebars(),]
    };
    const environment = new low_1.Environment(modules, Config.tasks, Config.environment);
    await environment.init();
})().then().catch(err => console.error);
//# sourceMappingURL=index.js.map