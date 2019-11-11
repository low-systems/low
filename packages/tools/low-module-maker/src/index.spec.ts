import * as FS from 'fs';
import * as Path from 'path';

import { ModuleConfig, createModule } from './index';

test('should be able to template a new module', () => {
  const config: ModuleConfig = {
    name: 'Test',
    type: 'Doer',
    outputDir: Path.join(__dirname, '..', 'test'),
    author: 'Matthew Wilkes (@SCVO)',
    authorUrl: 'https://scvo.org',
    repository: 'https://github.com/low-systems/test',
    description: 'This is a test module',
    homepage: 'https://github.com/low-systems/test#readme',
    organisation: 'low-systems'
  }

  createModule(config);
  const outputPackage = Path.join(config.outputDir, 'package.json');

  expect(FS.existsSync(outputPackage)).toBeTruthy();
});