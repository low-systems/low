#!/usr/bin/env node

const ExecSync = require('child_process').execSync;
const Path = require('path');
const Glob = require('glob');

ExecSync(`rm -rf ./node_modules`);
ExecSync(`rm package-lock.json`);

const packagesGlob = Path.join(__dirname, '..', 'packages', '@(cache-managers|connectors|doers|parsers|renderers|core|tools)', '*', 'node_modules');
const packagesModules = Glob.sync(packagesGlob);

for (const modulesDir of packagesModules) {
  console.log(`Removing ${modulesDir}`);
  ExecSync(`rm -rf ${modulesDir}`);
}

const packageLocksGlob = Path.join(__dirname, '..', 'packages', '@(cache-managers|connectors|doers|parsers|renderers|core|tools)', '*', 'package-lock.json');
const packageLocks = Glob.sync(packageLocksGlob);

for (const packageLock of packageLocks) {
  console.log(`Removing ${packageLock}`);
  ExecSync(`rm ${packageLock}`);
}