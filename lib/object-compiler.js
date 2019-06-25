"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ObjectCompiler {
    static isPointer(property) {
        return property && property.hasOwnProperty('__pointer');
    }
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
            const output = {};
            for (const [key, value] of Object.entries(property)) {
                output[key] = await ObjectCompiler.compileProperty(value, context);
            }
            return output;
        }
        return property;
    }
    static resolvePointer(property, context) {
        if (!property || !property.hasOwnProperty('__pointer'))
            return property;
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
    static objectPath(obj, path) {
        if (!ObjectCompiler.objectPathCache.hasOwnProperty(path)) {
            //TODO: How could this be exploited? Do I need to do any sanitising of `path`?
            ObjectCompiler.objectPathCache[path] = new Function("obj", "return obj." + path + ";");
        }
        const resolved = ObjectCompiler.objectPathCache[path](obj);
        return resolved;
    }
}
ObjectCompiler.objectPathCache = {};
exports.ObjectCompiler = ObjectCompiler;
//# sourceMappingURL=object-compiler.js.map