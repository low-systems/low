"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Path = __importStar(require("path"));
const FS = __importStar(require("fs"));
const Glob = __importStar(require("glob"));
const Dot = __importStar(require("dot-object"));
const Handlebars = __importStar(require("handlebars"));
const deepmerge_1 = __importDefault(require("deepmerge"));
const JSON6 = require('json-6');
// tslint:disable:no-parameter-reassignment
function transpile(input, cwd) {
    const inputType = typeof input;
    try {
        if (!['string', 'object'].includes(inputType)) {
            throw new Error('Can only transpile objects or strings of JSON');
        }
        const object = typeof input === 'string' ? JSON6.parse(input) : input;
        const transpiled = traverse(object, cwd);
        return transpiled;
    }
    catch (err) {
        console.error(`Failed to transpile -> Input Type: ${inputType}, CWD: ${cwd}\n`, err, '\n', input);
        if (inputType !== 'string') {
            return JSON.stringify(input);
        }
        else {
            return input;
        }
    }
}
exports.transpile = transpile;
function traverse(object, cwd) {
    if (typeof object !== 'object' || object === null) {
        return object;
    }
    if (Array.isArray(object)) {
        for (let i = 0; i < object.length; i++) {
            object[i] = traverse(object[i], cwd);
        }
    }
    else {
        if (typeof object === 'object' && object !== null && typeof object['+'] !== 'undefined') {
            let output = null;
            switch (object['+']) {
                case ('include'):
                    output = doInclude(object, cwd);
                    break;
                case ('concat'):
                    output = doConcat(object, cwd);
                    break;
                case ('merge'):
                    output = doMerge(object, cwd);
                    break;
            }
            object = output;
        }
        else {
            for (const key of Object.keys(object)) {
                object[key] = traverse(object[key], cwd);
            }
        }
    }
    return object;
}
function doInclude(config, cwd) {
    const globOptions = { cwd };
    Object.assign(globOptions, config.__globOptions || {});
    globOptions.absolute = true;
    const hasMagic = Glob.hasMagic(config.__glob, globOptions);
    const paths = Glob.sync(config.__glob, globOptions);
    const keyTemplate = config.__keyTemplate ? Handlebars.compile(config.__keyTemplate) : null;
    const output = hasMagic ? keyTemplate ? {} : [] : null;
    const dataType = config.__dataType || 'string';
    for (const path of paths) {
        const itemCwd = Path.dirname(path);
        const content = FS.readFileSync(path).toString();
        let item = content;
        switch (dataType) {
            case ('number'):
                item = parseInt(content);
                break;
            case ('boolean'):
                item = Boolean(content);
                break;
            case ('object'):
                item = transpile(content, itemCwd);
                if (config.__dotPath) {
                    item = Dot.pick(config.__dotPath, item);
                }
                break;
        }
        if (!hasMagic) {
            return item;
        }
        if (keyTemplate) {
            const context = Path.parse(path);
            context.parts = itemCwd.substr(1).split('/').reverse(); //TODO: Make this Windows friendly
            const key = keyTemplate(context);
            output[key] = item;
        }
        else {
            output.push(item);
        }
    }
    return output;
}
function doConcat(config, cwd) {
    let output = [];
    for (const item of config.__items) {
        let resolved = item;
        if (typeof item === 'object' && item !== null && typeof item['+'] !== 'undefined' && item['+'] === 'include') {
            resolved = doInclude(item, cwd);
        }
        if (Array.isArray(resolved)) {
            output.push(...resolved);
        }
        else {
            output.push(resolved);
        }
    }
    if (config.__removeEmpty) {
        output = output.filter(item => item !== null && item !== '' && typeof item !== 'undefined');
    }
    return output;
}
function doMerge(config, cwd) {
    let output = {};
    const mergeOptions = config.__mergeOptions || {};
    for (const item of config.__items) {
        let resolved = item;
        if (typeof item === 'object' && item !== null && typeof item['+'] !== 'undefined' && item['+'] === 'include') {
            resolved = doInclude(item, cwd);
        }
        if (Array.isArray(resolved)) {
            for (const resolvedItem of resolved) {
                output = deepmerge_1.default(output, resolvedItem, mergeOptions);
            }
        }
        else {
            output = deepmerge_1.default(output, resolved, mergeOptions);
        }
    }
    return output;
}
//# sourceMappingURL=index.js.map