#!/usr/bin/env node

const FS = require('fs');
const Path = require('path');
const ExecSync = require('child_process').execSync;

const Glob = require('glob');
require('colors');

const packagesGlob = Path.join(__dirname, '..', 'packages', '@(cache-managers|connectors|doers|parsers|renderers|core|tools)', '*');
const packagesPaths = Glob.sync(packagesGlob, { absolute: true });
const packages = [
  {
    dir: process.cwd(),
    name: 'Root',
    packageJson: Path.join(process.cwd(), 'package.json')
  },
  ...packagesPaths.map(dir => {
    return {
      dir,
      name: Path.basename(dir),
      packageJson: Path.join(dir, 'package.json')
    };
  })
];

console.log(`\nPackages (${packagesGlob}):`.bgMagenta.black);
console.log(' ├', packages.map(package => package.name).join('\n ├ '));

for (const package of packages) {
  console.log(`\nProcessing Package ${package.name}`.bgMagenta.black);

  if (!FS.existsSync(package.packageJson)) {
    console.warn(` ├`, `Package '${package.name}' is not a Node package`.yellow);
    continue;
  }

  ExecSync('npm update --dev', { cwd: package.dir, stdio: 'inherit' });
  console.log('Done.');
}