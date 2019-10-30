"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('source-map-support').install();
const FS = require("fs");
const Path = require("path");
const json_i_1 = require("@low-systems/json-i");
const low_1 = require("low");
async function main() {
    const configs = transpileConfigs();
    console.log(JSON.stringify(configs, null, 2));
    process.env.SECRETS = JSON.stringify(configs.secrets);
    const environment = new low_1.Environment({}, configs.tasks, configs.environment);
    await environment.init();
}
exports.main = main;
main().then(() => {
    console.log('Done.');
}).catch(err => {
    console.error(err);
});
function transpileConfigs() {
    const dir = Path.join(__dirname, '..', 'configuration');
    const path = Path.join(dir, 'main.json5');
    const contents = FS.readFileSync(path).toString();
    const transpiled = json_i_1.transpile(contents, dir);
    return transpiled;
}
exports.transpileConfigs = transpileConfigs;
//# sourceMappingURL=index.js.map