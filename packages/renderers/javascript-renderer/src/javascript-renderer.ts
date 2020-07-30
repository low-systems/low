import { Renderer, RenderConfig, Context, IMap } from 'low';

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
      const output = await func.call(context, metadata);
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

      const func = this.makeFunction(config.__template.code, config.__template.name);

      if (typeof config.__template.name === 'string') {
        this.functions[config.__template.name] = func;
      }

      return func;
    } else {
      throw new Error(`Invalid Javascript template. Templates must either be the name of a pre-compiled template or contain an object with a 'code' property that`);
    }
  }

  makeFunction(code: string, name?: string): Function {
    let promise = `return new Promise((resolve, reject) => {
        try {
          ${code}
        } catch (err) {
          reject(err);
        }
      });`;
    if (name) {
      promise = `//# sourceURL=${name}\n${promise}`;
    }

    const func = new Function('metadata', promise);
    return func;
  }
}

export interface JavascriptConfig {
  functions?: IMap<string>;
}

export type JavascriptTemplate = string | {
  name?: string;
  code: string;
};