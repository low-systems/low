// import Module from 'module';
// import Url from 'url';
import VM from 'vm';

import { Doer } from './doer';
import { ConnectorContext, Environment } from '..';
export class JSDoer extends Doer<JSDoerConfig, any> {
  moduleContext: any;
  module: any;
  modules: any;

  async setup() {
    const code = typeof this.config.code === 'string' ? this.config.code : '';
    await this.loadCode(code);
  }

  async loadCode (code) {
    try {
      this.moduleContext = VM.createContext({
        require: (filename) => {
          const module = require(filename);
          return module;
        },
        exports: {}
      });

      this.module = new (VM as any).SourceTextModule(code, {
        context: this.moduleContext,
        initializeImportMeta(meta) {
          meta.url = __dirname
        }
      });

      await this.module.link(async (specifier, referencingModule) => {
        return new Promise(async (resolve, reject) => {
          const module = await import(specifier);
          const exportNames = Object.keys(module);

          const syntheticModule = new (VM as any).SyntheticModule(
            exportNames,
            function () {
              exportNames.forEach(key => {
                (this as any).setExport(key, module[key]);
              });
            }, { context: this.moduleContext }
          );

          resolve(syntheticModule);
        });
      });

      await this.module.evaluate();

      this.modules = this.moduleContext.exports;
    } catch (err) {
      console.error(`FAILED TO LOAD CODE:`, err.message);
    }
  }

  async main(context, taskConfig, config) {
    try {
      const module = this.modules[config.module];
      const method = module[config.method || 'main'];
      const output = await method(this.env, context, config.parameters);
      return output;
    } catch (err) {
      throw err;
    }
  }
}

export type JSModuleFunction = (env: Environment, context: ConnectorContext<any>, parameters: any) => Promise<any>;

// export interface JSTask {
//   module: string;
//   code?: string;
//   parameters: IMap<any>;
//   method?: string;
// }

export interface JSDoerConfig {
  code: string;
}