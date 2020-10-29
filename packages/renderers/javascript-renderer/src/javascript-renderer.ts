import { Renderer, RenderConfig, Context, IMap } from 'low';

import * as Crypto from 'crypto';
import * as FS from 'fs';
import * as Path from 'path';
import * as Querystring from 'querystring';
import * as Url from 'url';

export class JavascriptRenderer extends Renderer<JavascriptConfig, any, JavascriptTemplate> {
  functions: IMap<Function> = {};

  async setup() {
    this.registerFunctions();
  }

  registerFunctions() {
    if (this.config.functions) {
      for (const [name, code] of Object.entries(this.config.functions)) {
        const func = this.makeFunction(code, name);
        this.functions[name] = func;
      }
    }
  }

  async core(func: Function, context: Context, metadata: any): Promise<any> {
    try {
      const imports: { [name: string]: any } = {
        crypto: Crypto,
        fs: FS,
        path: Path,
        querystring: Querystring,
        url: Url
      };

      if (metadata && Array.isArray(metadata.imports)) {
        metadata.imports.forEach((importName: string) => {
          imports[importName] = require(importName);
        });
      }

      const output = await func.call(context, metadata, this.functions, imports);
      return output;
    } catch(err) {
      throw err;
    }
  }

  async getTemplate(config: RenderConfig<JavascriptTemplate>, context: Context): Promise<any> {
    if (typeof config.__template === 'string') {
      if (this.functions.hasOwnProperty(config.__template)) {
        return this.functions[config.__template];
      }
      throw new Error(`Pre-registered function '${config.__template}' could not be found`);
    } else if (typeof config.__template === 'object' && config.__template !== null) {
      if (typeof config.__template.name === 'string' && this.functions.hasOwnProperty(config.__template.name)) {
        return this.functions[config.__template.name];
      }

      if (typeof config.__template.name !== 'string') {
        config.__template.name = Crypto.createHash('sha1').update(config.__template.code).digest('hex');
      }

      const func = this.makeFunction(config.__template.code, config.__template.name);
      this.functions[config.__template.name] = func;

      return func;
    } else {
      throw new Error(`Invalid Javascript template. Templates must either be the name of a pre-compiled template or contain an object with a 'code' property that`);
    }
  }

  makeFunction(code: string, name?: string): Function {
    const promiseCode = this.wrapCode(code, name);
    try {
      const func = new Function('metadata', 'functions', 'imports', promiseCode);
      return func;
    } catch (err) {
      console.error(`Failed to make function '${name || 'without a name'}': ${err.message}`);
      console.error(err.stack);
      console.error(promiseCode);
      const errorCode = `throw new Error("Cannot call function ${name || 'without a name'} as it contains a syntax error");`;
      const wrappedErrorCode = this.wrapCode(errorCode, name);
      const func = new Function('metadata', 'functions', 'imports', wrappedErrorCode);
      return func;
    }
  }

  wrapCode(code: string, name?: string) {
    const sourceUrl = name ? `//# sourceURL=${name}\n` : '';
    const wrappedCode = `return new Promise((resolve, reject) => {
      try {
        ${sourceUrl}${code}
      } catch (err) {
        reject(err);
      }
    });`;
    return wrappedCode;
  }
}

export interface JavascriptConfig {
  functions?: IMap<string>;
}

export type JavascriptTemplate = string | {
  name?: string;
  code: string;
};