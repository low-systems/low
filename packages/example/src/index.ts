require('source-map-support').install();

import { DoerRequest } from '@low-systems/doer-request';
import { ConnectorHttp } from '@low-systems/connector-http';
import { RendererHandlebars } from '@low-systems/renderer-handlebars';
import { Environment, Modules } from 'low';

const Config = require('../configuration/main.json');

(async () => {
  process.env.SECRETS = JSON.stringify(Config.secrets);
  const modules: Modules = {
    connectors: [ new ConnectorHttp(), ],
    doers: [ new DoerRequest(), ],
    renderers: [ new RendererHandlebars(), ]
  }
  const environment = new Environment(modules, Config.tasks, Config.environment);
  await environment.init();
})().then().catch(err => console.error);