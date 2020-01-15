#!/usr/bin/env node

const ExecSync = require('child_process').execSync;
const Path = require('path');
const Glob = require('glob');
require('colors');

const bumpArg = process.argv[2] || '';
const semverRegex = /^((([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?)(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?)$/i;
const semverKeywords = ['major', 'minor', 'patch', 'premajor', 'preminor', 'prepatch', 'prerelease'];

if (semverRegex.test(bumpArg)) {
  console.log(`Updating version of all packages to '${bumpArg}'`);
  ExecSync(`lerna version ${bumpArg} -y --force-publish`);
} else if (semverKeywords.includes(bumpArg)) {
  console.log(`Bumping ${bumpArg.toUpperCase} version of all packages`);
  ExecSync(`lerna version ${bumpArg} -y --force-publish`);
}

const packagesGlob = Path.join(__dirname, '..', 'packages', '@(cache-managers|connectors|doers|parsers|renderers|core|tools)', '*');
const packagesDirs = Glob.sync(packagesGlob);

for (const packageDir of packagesDirs) {
  const packageName = Path.basename(packageDir);
  console.log(`Publishing ${packageName}`.bgMagenta.black);
  ExecSync(`npm publish`, { cwd: packageDir });
}
