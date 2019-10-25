import * as Path from 'path';
import * as FS from 'fs';

import { transpile } from './index';

test('should be able to successfully transpile test.json', async () => {
  const testFilePath = Path.join(__dirname, '..', 'test-data', 'test.json5');
  const testFileDir = Path.dirname(testFilePath);
  const testJson = FS.readFileSync(testFilePath).toString();
  console.log('INPUT STRING:', testJson);
  const transpiled = transpile(testJson, testFileDir);
  console.log('OUTPUT STRING:', JSON.stringify(transpiled, null, 2));
});