import * as Path from 'path';
import * as FS from 'fs';

import * as Glob from 'glob';
import * as Dot from 'dot-object';
import * as Handlebars from 'handlebars';
import * as DeepMerge from 'deepmerge';

const JSON6 = require('json-6');

// tslint:disable:no-parameter-reassignment
export function transpile(input: any, cwd: string): any {
  const inputType = typeof input;
  try {
    if (!['string', 'object'].includes(inputType)) {
      throw new Error('Can only transpile objects or strings of JSON');
    }
    const object = typeof input === 'string' ? JSON6.parse(input) : input;
    const transpiled = traverse(object, cwd);
    return transpiled;
  } catch (err) {
    console.error(`Failed to transpile -> Input Type: ${inputType}, CWD: ${cwd}\n`, err, '\n', input);
    if (inputType !== 'string') {
      return JSON.stringify(input);
    } else {
      return input;
    }
  }
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
    if (typeof object === 'object' && object !== null && typeof object['+'] !== 'undefined') {
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
  const globOptions: Glob.IOptions = { cwd };
  Object.assign(globOptions, config.__globOptions || {});
  globOptions.absolute = true;

  const hasMagic = Glob.hasMagic(config.__glob, globOptions);
  const paths = Glob.sync(config.__glob, globOptions);

  const keyTemplate = config.__keyTemplate ? Handlebars.compile(config.__keyTemplate) : null;
  const output: any = hasMagic ? keyTemplate ? {} : [] : null;

  const dataType = config.__dataType || 'string';
  for (const path of paths) {
    const itemCwd = Path.dirname(path);
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
        item = transpile(content, itemCwd);
        if (config.__dotPath) {
          item = Dot.pick(config.__dotPath, item);
        }
        break;
    }

    if (!hasMagic) {
      return item;
    }

    if (keyTemplate) {
      const context: any = Path.parse(path);
      context.parts = itemCwd.substr(1).split('/').reverse(); //TODO: Make this Windows friendly
      const key = keyTemplate(context);
      output[key] = item;
    } else {
      output.push(item);
    }
  }

  return output;
}

function doConcat(config: ConcatConfig, cwd: string) {
  let output: any[] = [];

  for (const item of config.__items) {
    let resolved: any = item;
    if (typeof item === 'object' && item !== null && typeof item['+'] !== 'undefined' && item['+'] === 'include') {
      resolved = doInclude(item as IncludeConfig, cwd);
    }

    if (Array.isArray(resolved)) {
      output.push(...resolved);
    } else {
      output.push(resolved);
    }
  }

  if (config.__removeEmpty) {
    output = output.filter(item => item !== null && item !== '' && typeof item !== 'undefined');
  }

  return output;
}

function doMerge(config: MergeConfig, cwd: string) {
  let output: any = {};
  const mergeOptions = config.__mergeOptions || {};

  for (const item of config.__items) {
    let resolved: any = item;
    if (typeof item === 'object' && item !== null && typeof item['+'] !== 'undefined' && item['+'] === 'include') {
      resolved = doInclude(item as IncludeConfig, cwd);
    }

    if (Array.isArray(resolved)) {
      for (const resolvedItem of resolved) {
        output = DeepMerge(output, resolvedItem, mergeOptions);
      }
    } else {
      output = DeepMerge(output, resolved, mergeOptions);
    }
  }

  return output;
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
  __keyTemplate?: string;
}

interface ConcatConfig extends PotentialObject {
  '+': 'concat';
  __items: PotentialObject[];
  __removeEmpty?: boolean;
}

interface MergeConfig extends PotentialObject {
  '+': 'merge';
  __items: PotentialObject[];
  __mergeOptions?: DeepMerge.Options
}