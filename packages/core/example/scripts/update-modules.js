const Path = require('path');
const Exec = require('child_process').execSync;

const modules = [
  'low',
  'connector-http',
  'doer-request',
  'renderer-handlebars'
];
const moduleDirs = [];

const baseDir = process.cwd();

console.log('');

for (const module of modules) {
  const moduleDir = Path.join(baseDir, '..', module);
  console.log(`Building module: ${module}`);
  Exec(`node_modules/.bin/tsc`, { cwd: moduleDir, stdio: 'inherit' });
  moduleDirs.push('../' + module);
}

console.log(`Installing modules: ${moduleDirs.join(', ')}`);
Exec(`npm i --save ${moduleDirs.join(' ')}`, { stdio: 'inherit' });