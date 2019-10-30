#!/usr/bin/env node

const FS = require('fs');
const Path = require('path');
const ExecSync = require('child_process').execSync;

const Glob = require('glob');
require('colors');

const rootBinDir = Path.join(__dirname, '..', 'node_modules', '.bin', '*');
const rootBinaryPaths = Glob.sync(rootBinDir, { absolute: true });
const rootBinaries = rootBinaryPaths.map(Path.parse);

console.log(`\nRoot Binaries (${rootBinDir}):`.bgMagenta.black);
console.log(' ├', rootBinaries.map(binary => binary.name).join('\n ├ '));

const packagesGlob = Path.join(__dirname, '..', 'packages', '*');
const packagesPaths = Glob.sync(packagesGlob, { absolute: true });
const packages = packagesPaths.map(dir => {
  return {
    dir,
    name: Path.basename(dir),
    modulesDir: Path.join(dir, 'node_modules'),
    binDir: Path.join(dir, 'node_modules', '.bin'),
    packageJson: Path.join(dir, 'package.json')
  };
});

console.log(`\nPackages (${packagesGlob}):`.bgMagenta.black);
console.log(' ├', packages.map(package => package.dir).join('\n ├ '));

for (const package of packages) {
  console.log(`\nProcessing Package ${package.name}`.bgMagenta.black);

  if (!FS.existsSync(package.packageJson)) {
    console.warn(` ├`, `Package '${package.name}' is not a Node package`.yellow);
    continue;
  }

  if (!FS.existsSync(package.modulesDir)) {
    console.warn(` ├`, `Package '${package.name}' does not have a node_modules directory. Running 'npm i'...`.yellow);
    process.chdir(package.dir);
    ExecSync('npm i', { cwd: package.dir, stdio: 'inherit' });

    if (!FS.existsSync(package.binDir)) {
      FS.mkdirSync(package.binDir, { recursive: true });
    }
  }

  if (!FS.existsSync(package.binDir)) {
    console.warn(` ├`, `Package '${package.name}' does not have a node_modules/.bin directory so creating it`);
    FS.mkdirSync(package.binDir, { recursive: true });
  }

  for (const rootBinary of rootBinaries) {
    const packageBinaryPath = Path.join(package.binDir, rootBinary.name);
    if (FS.existsSync(packageBinaryPath)) {
      console.log(` ├`, `Binary '${rootBinary.name}' already exists`.brightGreen);
    } else {
      console.log(` └`, `Binary '${rootBinary.name}' does not exist, creating symlink...`.yellow);
      const rootBinaryPath = Path.join(rootBinary.dir, rootBinary.name);
      FS.symlinkSync(rootBinaryPath, packageBinaryPath);
      const localBinPath = Path.join('node_modules', '.bin', rootBinary.name);
      console.log(`   └`, `Symlink created: ${localBinPath} => ${rootBinaryPath}`.green)
    }
  }
}