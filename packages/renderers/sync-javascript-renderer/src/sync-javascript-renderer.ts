import { JavascriptRenderer } from '@low-systems/javascript-renderer';
import { Context } from 'low';

import * as Crypto from 'crypto';
import * as FS from 'fs';
import * as Path from 'path';
import * as Querystring from 'querystring';
import * as Url from 'url';

export class SyncJavascriptRenderer extends JavascriptRenderer {
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

      const output = func(context, metadata, this.functions, imports);
      return output;
    } catch(err) {
      throw err;
    }
  }

  makeFunction(code: string, name?: string): Function {
    const sourceMap = name ? `//# sourceURL=${name}` : '';
    let syncCode = !code.match(/(return)|\r\n/g) ? `${sourceMap}\nreturn (${code})` : `${sourceMap}\n${code}`;
    const func = new Function('context', 'metadata', 'functions', 'imports', syncCode);
    return func;
  }
}