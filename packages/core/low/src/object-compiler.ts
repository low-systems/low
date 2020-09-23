
import { Context } from './environment';
import { RenderConfig } from './renderers/renderer';

export class ObjectCompiler {
  static isTemplate(property: any): boolean {
    return typeof property === 'object' && property !== null && '__template' in property;
  }

  static async compile(config: any, context: Context, specialProperties?: string[]): Promise<any> {
    if (typeof config !== 'object' || config === null) {
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
    const resolvedProperty = ObjectCompiler.resolvePointer(property, context);

    if (ObjectCompiler.isObject(property) && '__pointer' in property &&  '__doNotCompile' in property) {
      return resolvedProperty;
    }

    if (ObjectCompiler.isTemplate(resolvedProperty)) {
      const renderer = context.env.getRenderer(resolvedProperty.__renderer || 'Renderer');
      return await renderer.render(resolvedProperty, context);
    }

    if (Array.isArray(resolvedProperty)) {
      const compiled = [];
      for (const item of resolvedProperty) {
        const spread = ObjectCompiler.isObject(item) && '__spread' in item;
        const resolved = await ObjectCompiler.compileProperty(item, context);

        if (spread && Array.isArray(resolved)) {
          compiled.push(...resolved);
        } else {
          compiled.push(resolved);
        }
      }
      return compiled;
    }

    if (typeof resolvedProperty === 'object' && resolvedProperty !== null && !('__doNotCompile' in resolvedProperty)) {
      const output: any = {};
      for (const [key, value] of Object.entries(resolvedProperty)) {
        const spread = typeof value === 'object' && value !== null && '__spread' in value;
        const resolved = await ObjectCompiler.compileProperty(value, context);

        if (spread && typeof resolved === 'object' && resolved !== null) {
          for (const [resolvedKey, resolvedValue] of Object.entries(resolved)) {
            output[resolvedKey] = resolvedValue;
          }
        } else {
          //Not sure why I need to cast value to any here. I'm already checking above that the key "__key" exists on it
          const keyConfig = typeof value === 'object' && value !== null && '__key' in value && (value as any).__key as RenderConfig<any> || null;

          if (keyConfig) {
            keyConfig.__parser = 'StringParser';
            const renderer = context.env.getRenderer(keyConfig.__renderer || 'Renderer');
            const renderedKey = await renderer.render((value as any).__key, { ...context, resolvedValue: value });
            output[renderedKey] = resolved;
          } else {
            output[key] = resolved;
          }
        }
      }

      return output;
    }

    return resolvedProperty;
  }

  static resolvePointer(property: any, context: Context) {
    if (typeof property !== 'object' || property === null || !('__pointer' in property)) return property;

    const value = ObjectCompiler.objectPath(context, property.__pointer);
    if (typeof value === 'undefined') {
      if ('__default' in property) {
        return property.__default;
      } else {
        throw new Error(`Could not resolve pointer "${property.__pointer}"`);
      }
    }

    return value;
  }

  static objectPathCache: { [path: string]: Function } = {};
  static objectPath(obj: any, path: string) {
    if (!ObjectCompiler.objectPathCache.hasOwnProperty(path)) {
      //TODO: How could this be exploited? Do I need to do any sanitising of `path`?
      ObjectCompiler.objectPathCache[path] = new Function("obj", "return obj." + path + ";");
    }
    try {
      const resolved = ObjectCompiler.objectPathCache[path](obj);
      return resolved;
    } catch (err) {
      return;
    }
  }

  static isObject(obj: any) {
    return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
  }
}