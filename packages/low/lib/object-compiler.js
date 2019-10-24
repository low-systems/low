"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//TODO: Should this be a Module or is that going to far?
//I'm leaning on No because this is a bit fundamental and secret-sauce
class ObjectCompiler {
    static isTemplate(property) {
        return property && (property.hasOwnProperty('__template') || property.hasOwnProperty('__templatePath'));
    }
    static async compile(config, context, specialProperties) {
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
        }
        else {
            output = await ObjectCompiler.compileProperty(output, context);
        }
        return output;
    }
    static async compileProperty(property, context) {
        const resolvedProperty = ObjectCompiler.resolvePointer(property, context);
        if (ObjectCompiler.isTemplate(resolvedProperty)) {
            const renderer = context.env.getRenderer(resolvedProperty.__renderer);
            return await renderer.render(resolvedProperty, context);
        }
        if (Array.isArray(resolvedProperty)) {
            const compiled = [];
            for (const item of resolvedProperty) {
                const resolved = await ObjectCompiler.compileProperty(item, context);
                compiled.push(resolved);
            }
            return compiled;
        }
        if (typeof resolvedProperty === 'object') {
            const output = {};
            for (const [key, value] of Object.entries(resolvedProperty)) {
                output[key] = await ObjectCompiler.compileProperty(value, context);
            }
            return output;
        }
        return resolvedProperty;
    }
    static resolvePointer(property, context) {
        if (!property || !property.hasOwnProperty('__pointer'))
            return property;
        const value = ObjectCompiler.objectPath(context, property.__pointer);
        if (typeof value === 'undefined') {
            throw new Error(`Could not resolve pointer "${property.__pointer}"`);
        }
        return value;
    }
    static objectPath(obj, path) {
        if (!ObjectCompiler.objectPathCache.hasOwnProperty(path)) {
            //TODO: How could this be exploited? Do I need to do any sanitising of `path`?
            ObjectCompiler.objectPathCache[path] = new Function("obj", "return obj." + path + ";");
        }
        const resolved = ObjectCompiler.objectPathCache[path](obj);
        return resolved;
    }
}
exports.ObjectCompiler = ObjectCompiler;
ObjectCompiler.objectPathCache = {};
//# sourceMappingURL=object-compiler.js.map