"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class ObjectCompiler {
    static isTemplate(property) {
        return typeof property === 'object' && property !== null && '__template' in property;
    }
    static compile(config, context, specialProperties) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof config !== 'object' || config === null) {
                return config;
            }
            //May not be necessary
            let output = JSON.parse(JSON.stringify(config));
            if (specialProperties) {
                for (const prop of specialProperties) {
                    const property = ObjectCompiler.objectPath(output, prop);
                    output[prop] = yield ObjectCompiler.compileProperty(property, context);
                }
            }
            else {
                output = yield ObjectCompiler.compileProperty(output, context);
            }
            return output;
        });
    }
    static compileProperty(property, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const resolvedProperty = ObjectCompiler.resolvePointer(property, context);
            if (ObjectCompiler.isObject(property) && '__pointer' in property && '__doNotCompile' in property) {
                return resolvedProperty;
            }
            if (ObjectCompiler.isTemplate(resolvedProperty)) {
                const renderer = context.env.getRenderer(resolvedProperty.__renderer || 'Renderer');
                return yield renderer.render(resolvedProperty, context);
            }
            if (Array.isArray(resolvedProperty)) {
                const compiled = [];
                for (const item of resolvedProperty) {
                    const spread = ObjectCompiler.isObject(item) && '__spread' in item;
                    const resolved = yield ObjectCompiler.compileProperty(item, context);
                    if (spread && Array.isArray(resolved)) {
                        compiled.push(...resolved);
                    }
                    else {
                        compiled.push(resolved);
                    }
                }
                return compiled;
            }
            if (typeof resolvedProperty === 'object' && resolvedProperty !== null && !('__doNotCompile' in resolvedProperty)) {
                const output = {};
                for (const [key, value] of Object.entries(resolvedProperty)) {
                    const spread = typeof value === 'object' && value !== null && '__spread' in value;
                    const resolved = yield ObjectCompiler.compileProperty(value, context);
                    if (spread && typeof resolved === 'object' && resolved !== null) {
                        for (const [resolvedKey, resolvedValue] of Object.entries(resolved)) {
                            output[resolvedKey] = resolvedValue;
                        }
                    }
                    else {
                        //Not sure why I need to cast value to any here. I'm already checking above that the key "__key" exists on it
                        const keyConfig = typeof value === 'object' && value !== null && '__key' in value && value.__key || null;
                        if (keyConfig) {
                            keyConfig.__parser = 'StringParser';
                            const renderer = context.env.getRenderer(keyConfig.__renderer || 'Renderer');
                            const renderedKey = yield renderer.render(value.__key, Object.assign(Object.assign({}, context), { resolvedValue: value }));
                            output[renderedKey] = resolved;
                        }
                        else {
                            output[key] = resolved;
                        }
                    }
                }
                return output;
            }
            return resolvedProperty;
        });
    }
    static resolvePointer(property, context) {
        if (typeof property !== 'object' || property === null || !('__pointer' in property))
            return property;
        const value = ObjectCompiler.objectPath(context, property.__pointer);
        if (typeof value === 'undefined') {
            if ('__default' in property) {
                return property.__default;
            }
            else {
                throw new Error(`Could not resolve pointer "${property.__pointer}"`);
            }
        }
        return value;
    }
    static objectPath(obj, path) {
        if (!ObjectCompiler.objectPathCache.hasOwnProperty(path)) {
            //TODO: How could this be exploited? Do I need to do any sanitising of `path`?
            ObjectCompiler.objectPathCache[path] = new Function("obj", "return obj." + path + ";");
        }
        try {
            const resolved = ObjectCompiler.objectPathCache[path](obj);
            return resolved;
        }
        catch (err) {
            return;
        }
    }
    static isObject(obj) {
        return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
    }
}
exports.ObjectCompiler = ObjectCompiler;
ObjectCompiler.objectPathCache = {};
//# sourceMappingURL=object-compiler.js.map