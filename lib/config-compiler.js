"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Dot = require("dot-object");
class ConfigCompiler {
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
                const property = Dot.pick(prop, output);
                output[prop] = await ConfigCompiler.compileProperty(property, context);
            }
        }
        else {
            output = await ConfigCompiler.compileProperty(output, context);
        }
        return output;
    }
    static async compileProperty(property, context) {
        property = ConfigCompiler.resolvePointer(property, context);
        if (ConfigCompiler.isTemplate(property)) {
            const renderer = context.env.getRenderer(property.__renderer);
            return await renderer.render(property, context);
        }
        if (Array.isArray(property)) {
            return property.map(async (prop) => {
                return await ConfigCompiler.compileProperty(prop, context);
            });
        }
        if (typeof property === 'object') {
            const output = {};
            for (const [key, value] of Object.entries(property)) {
                output[key] = await ConfigCompiler.compileProperty(value, context);
            }
            return output;
        }
        return property;
    }
    static resolvePointer(property, context) {
        if (!property || !property.hasOwnProperty('__pointer'))
            return property;
        const value = Dot.pick(property.__pointer, context);
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
}
exports.ConfigCompiler = ConfigCompiler;
//# sourceMappingURL=config-compiler.js.map