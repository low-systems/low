require('source-map-support').install();

import { RequestDoer } from '@low-systems/request-doer';
import { HttpConnector } from '@low-systems/http-connector';
import { HandlebarsRenderer } from '@low-systems/handlebars-renderer';
import { Environment, Modules } from 'low';

const Config = require('../configuration/main.json');

export async function main() {
  console.log(Config);
  process.env.SECRETS = JSON.stringify(Config.secrets);
  const modules: Modules = {
    connectors: [ new HttpConnector(), ],
    doers: [ new RequestDoer(), ],
    renderers: [ new HandlebarsRenderer(), ]
  }
  const environment = new Environment(modules, Config.tasks, Config.environment);
  await environment.init();
}

main().then().catch(err => console.error);