#!/usr/bin/env node

import * as FS from 'fs';
import * as Path from 'path';

import { transpile } from './index';

(() => {
  try {
    const inputPath = getInputPath();
    console.log(`Input: ${inputPath}`);

    const outputPath = getOutputPath();
    console.log(`Output: ${outputPath}`);

    const fileContents = FS.readFileSync(inputPath).toString();
    console.log(`Input size: ${fileContents.length}`);

    const cwd = Path.dirname(inputPath);
    const transpiled = transpile(fileContents, cwd);

    saveOutput(transpiled, outputPath);
  } catch (err) {
    console.error(err.message);
  }
})();


function getInputPath(): string {
  if (process.argv.length < 3) {
    throw new Error('No input path provided');
  }

  let inputPath = process.argv[2];
  inputPath = Path.isAbsolute(inputPath) ? inputPath : Path.join(process.cwd(), inputPath);

  const fileExists = FS.existsSync(inputPath);
  if (!fileExists) {
    throw new Error(`File not found`);
  }

  return inputPath;
}

function getOutputPath(): string {
  if (process.argv.length < 4) {
    console.error('No output path provided');
    process.exit(1);
  }

  let outputPath = process.argv[3];
  outputPath = Path.isAbsolute(outputPath) ? outputPath : Path.join(process.cwd(), outputPath);

  return outputPath;
}

function saveOutput(transpiled: any, outputPath: string) {
  const outputDir = Path.dirname(outputPath);
  const dirExists = FS.existsSync(outputDir);
  if (!dirExists) {
    console.warn(`Output directory does not exist so creating it (${outputDir})`);
    FS.mkdirSync(outputDir, { recursive: true });
  }

  const output = JSON.stringify(transpiled, null, 2);
  console.log(`Writing output (${output.length} bytes)`);

  FS.writeFileSync(outputPath, output);
  console.log('Finished!');
}