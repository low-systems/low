require('source-map-support').install();

import * as FS from 'fs';
import * as Path from 'path';

import { transpile } from '@low-systems/json-i';
import { Environment } from 'low';

export async function main() {
  const configs = transpileConfigs();
  console.log(JSON.stringify(configs, null, 2));
  process.env.SECRETS = JSON.stringify(configs.secrets);
  const environment = new Environment({}, configs.tasks, configs.environment);
  await environment.init();
}

main().then(() => {
  console.log('Done.');
}).catch(err => {
  console.error(err);
});

export interface ConfigBundle {
  environment: any;
  secrets: any;
  tasks: any[];
}

export function transpileConfigs(): ConfigBundle {
  const dir = Path.join(__dirname, '..', 'configuration');
  const path = Path.join(dir, 'main.json5');
  const contents = FS.readFileSync(path).toString();
  const transpiled = transpile(contents, dir);
  return transpiled as ConfigBundle;
}
