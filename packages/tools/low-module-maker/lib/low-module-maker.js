#!/usr/bin/env node
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Path = __importStar(require("path"));
const Readline = __importStar(require("readline-sync"));
const index_1 = require("./index");
(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log('');
    if (process.argv.length < 3) {
        console.error(`No module type provided. Expected first argument to be either: CacheManager, Connector, Doer, Parser, or Renderer`);
        process.exit(1);
    }
    if (process.argv.length < 4) {
        console.error('No name provided. Expected second argument to be a PascalCase name for your new module.');
        process.exit(1);
    }
    const moduleType = process.argv[2];
    const moduleName = process.argv[3];
    let moduleOutput = process.argv[4];
    if (moduleOutput) {
        if (!Path.isAbsolute(moduleOutput)) {
            moduleOutput = Path.join(process.cwd(), moduleOutput);
        }
    }
    else {
        moduleOutput = Path.join(process.cwd(), `${index_1.dasherise(moduleType)}-${index_1.dasherise(moduleName)}`);
    }
    const config = {
        name: moduleName,
        type: moduleType,
        outputDir: moduleOutput
    };
    const organisation = Readline.question('NPM organisation name (e.g. low-systems)? [optional]: ');
    if (organisation) {
        config.organisation = organisation;
    }
    const description = Readline.question('Module description? [optional]: ');
    if (description) {
        config.description = description;
    }
    const author = Readline.question('Author name? [optional]: ');
    if (author) {
        config.author = author;
    }
    const authorUrl = Readline.question('Author url? [optional]: ');
    if (authorUrl) {
        config.authorUrl = authorUrl;
    }
    const repository = Readline.question('Repository url (e.g. https://github.com/low-systems/my-module)? [optional]: ');
    if (repository) {
        config.repository = repository;
    }
    const homepage = Readline.question('Module homepage? [optional]: ');
    if (homepage) {
        config.homepage = homepage;
    }
    console.log('Configuration for new module');
    console.log(JSON.stringify(config, null, 2));
    index_1.createModule(config);
}))().then().catch(err => console.error);
//# sourceMappingURL=low-module-maker.js.map