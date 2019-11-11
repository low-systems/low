"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
const FS = require("fs");
const Glob = require("glob");
const Dot = require("dot-object");
const Handlebars = require("handlebars");
const DeepMerge = require("deepmerge");
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
                output = DeepMerge(output, resolvedItem, mergeOptions);
            }
        }
        else {
            output = DeepMerge(output, resolved, mergeOptions);
        }
    }
    return output;
}
//# sourceMappingURL=index.js.map