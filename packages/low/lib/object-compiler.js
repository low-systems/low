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
        return typeof property === 'object' && property !== null && property.hasOwnProperty('__template');
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
            if (ObjectCompiler.isTemplate(resolvedProperty)) {
                const renderer = context.env.getRenderer(resolvedProperty.__renderer);
                return yield renderer.render(resolvedProperty, context);
            }
            if (Array.isArray(resolvedProperty)) {
                const compiled = [];
                for (const item of resolvedProperty) {
                    const resolved = yield ObjectCompiler.compileProperty(item, context);
                    compiled.push(resolved);
                }
                return compiled;
            }
            if (typeof resolvedProperty === 'object' && resolvedProperty !== null && !resolvedProperty.hasOwnProperty('__doNotCompile')) {
                const output = {};
                for (const [key, value] of Object.entries(resolvedProperty)) {
                    output[key] = yield ObjectCompiler.compileProperty(value, context);
                }
                return output;
            }
            return resolvedProperty;
        });
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