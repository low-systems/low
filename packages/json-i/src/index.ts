import * as Path from 'path';
import * as FS from 'fs';

import * as Glob from 'glob';
import * as Dot from 'dot-object';
import * as DeepMerge from 'deepmerge';

const JSON6 = require('json-6');

// tslint:disable:no-parameter-reassignment
export function transpile(json: string, cwd: string): string {
  const object = JSON6.parse(json);

  const transpiled = traverse(object, cwd);
  const output = JSON6.stringify(transpiled);

  return output;
}

function traverse(object: PotentialObject, cwd: string): any {
  if (typeof object !== 'object' || object === null) {
    return object;
  }

  if (Array.isArray(object)) {
    for (let i = 0; i < object.length; i++) {
      object[i] = traverse(object[i], cwd);
    }
  } else {
    if (typeof object['+'] !== 'undefined') {
      let output: any = null;
      switch (object['+']) {
        case('include'):
          output = doInclude(object as IncludeConfig, cwd);
          break;
        case('concat'):
          output = doConcat(object as ConcatConfig, cwd);
          break;
        case('merge'):
          output = doMerge(object as MergeConfig, cwd);
          break;
      }
      object = output;
    } else {
      for (const key of Object.keys(object)) {
        object[key] = traverse(object[key], cwd);
      }
    }
  }

  return object;
}

function doInclude(config: IncludeConfig, cwd: string) {
  const globOptions = config.__globOptions || { };

  if (!globOptions.cwd) {
    globOptions.cwd = cwd;
  }

  const hasMagic = Glob.hasMagic(config.__glob, globOptions);
  const paths = Glob.sync(config.__glob, globOptions);

  const dataType = config.__dataType || 'string';
  for (const path of paths) {
    const content = FS.readFileSync(path).toString();
    let item: any = content;

    switch (dataType) {
      case ('number'):
        item = parseInt(content);
        break;
      case ('boolean'):
        item = Boolean(content);
        break;
      case ('object'):
        const itemCwd = Path.dirname(path);
        item = transpile(content, itemCwd);
        if (config.__dotPath) {
          item = Dot.pick(config.__dotPath, item);
        }
        break;
    }

    //If only one item we can just return it.
    //TODO: Need to work out config stuff for if we are mapping many
    //      files back to an object or array and do that on the else
    //      of this conditional
    if (!hasMagic) {
      return item;
    }
  }

  return null;
}

function doConcat(config: ConcatConfig, cwd: string) {
  return null
}

function doMerge(config: MergeConfig, cwd: string) {
  return null;
}

interface PotentialObject {
  '+'?: 'include' | 'concat' | 'merge';
  [key: string]: any;
}

interface IncludeConfig extends PotentialObject {
  '+': 'include';
  __glob: string;
  __globOptions?: Glob.IOptions;
  __dataType?: 'object' | 'string' | 'number' | 'boolean';
  __dotPath?: string;
}

interface ConcatConfig extends PotentialObject {
  '+': 'concat';
  __items: PotentialObject[];
  __removeFalsy?: boolean;
  __removeNull?: boolean;
  __removeDuplicates?: boolean;
}

interface MergeConfig extends PotentialObject {
  '+': 'merge';
  __items: PotentialObject[];
}