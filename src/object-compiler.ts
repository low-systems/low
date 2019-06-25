
import { Context } from './environment';

export class ObjectCompiler {
  static isPointer(property: any): boolean {
    return property && property.hasOwnProperty('__pointer');
  }

  static isTemplate(property: any): boolean {
    return property && (property.hasOwnProperty('__template') || property.hasOwnProperty('__templatePath'));
  }

  static async compile(config: any, context: Context, specialProperties?: string[]): Promise<any> {
    if (typeof config !== 'object') {
      return config;
    }

    //May not be necessary
    let output = JSON.parse(JSON.stringify(config));

    if (specialProperties) {
      for (const prop of specialProperties) {
        const property = ObjectCompiler.objectPath(output, prop);
        output[prop] = await ObjectCompiler.compileProperty(property, context);
      }
    } else {
      output = await ObjectCompiler.compileProperty(output, context);
    }

    return output;
  }

  static async compileProperty(property: any, context: Context): Promise<any> {
    property = ObjectCompiler.resolvePointer(property, context);

    if (ObjectCompiler.isTemplate(property)) {
      const renderer = context.env.getRenderer(property.__renderer);
      return await renderer.render(property, context);
    }

    if (Array.isArray(property)) {
      return property.map(async (prop) => {
        return await ObjectCompiler.compileProperty(prop, context);
      });
    }

    if (typeof property === 'object') {
      const output: any = {};
      for (const [key, value] of Object.entries(property)) {
        output[key] = await ObjectCompiler.compileProperty(value, context);
      }
      return output;
    }

    return property;
  }

  static resolvePointer(property: any, context: Context) {
    if (!property || !property.hasOwnProperty('__pointer')) return property;

    const value = ObjectCompiler.objectPath(context, property.__pointer);
    if (typeof value === 'undefined') {
      throw new Error(`Could not resolve pointer "${property.__pointer}"`);
    }

    if (property.__extend === true) {
      return Object.assign(value, property);
    }

    if (property.__output) {
      property[property.__output] = value;
      return property;
    }

    return value;
  }

  static objectPathCache: { [path: string]: Function } = {};
  static objectPath(obj: any, path: string) {
    if (!ObjectCompiler.objectPathCache.hasOwnProperty(path)) {
      //TODO: How could this be exploited? Do I need to do any sanitising of `path`?
      ObjectCompiler.objectPathCache[path] = new Function("obj", "return obj." + path + ";");
    }
    const resolved = ObjectCompiler.objectPathCache[path](obj);
    return resolved;
  }
}

export interface Pointer {
  __pointer: string;
}