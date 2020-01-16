"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const FS = __importStar(require("fs"));
const Path = __importStar(require("path"));
function createModule(config) {
    if (!FS.existsSync(config.outputDir)) {
        FS.mkdirSync(config.outputDir, { recursive: true });
    }
    const outputSrcDir = Path.join(config.outputDir, 'src');
    if (!FS.existsSync(outputSrcDir)) {
        FS.mkdirSync(outputSrcDir, { recursive: true });
    }
    const templateDir = Path.join(__dirname, '..', 'template-module');
    const boringFiles = ['tsconfig.json', 'tslint.json', 'typedoc.json'];
    for (const boringFile of boringFiles) {
        const sourcePath = Path.join(templateDir, boringFile);
        const destinationPath = Path.join(config.outputDir, boringFile);
        FS.copyFileSync(sourcePath, destinationPath);
    }
    const packageSource = Path.join(templateDir, 'package.json');
    const packageDestination = Path.join(config.outputDir, 'package.json');
    const packageJson = FS.readFileSync(packageSource).toString();
    const packageConfig = JSON.parse(packageJson);
    const dashedName = dasherise(config.name);
    const packageName = config.organisation ? `@${config.organisation}/${dashedName}` : dashedName;
    packageConfig.name = packageName;
    packageConfig.main = `lib/${dashedName}.js`;
    packageConfig.types = `lib/${dashedName}.d.ts`;
    packageConfig.description = config.description || `A ${config.type} module for low`;
    packageConfig.homepage = config.homepage;
    if (config.author) {
        packageConfig.author = {
            name: config.author,
            url: config.authorUrl
        };
    }
    if (config.repository) {
        packageConfig.repository = {
            type: 'git',
            url: config.repository
        };
    }
    const newPackageJson = JSON.stringify(packageConfig, null, 2);
    FS.writeFileSync(packageDestination, newPackageJson);
    const baseModuleName = dasherise(config.type);
    const baseModuleSource = Path.join(templateDir, 'src', baseModuleName + '.ts');
    const baseModuleDestination = Path.join(outputSrcDir, `${baseModuleName}-${dashedName}.ts`);
    let baseModule = FS.readFileSync(baseModuleSource).toString();
    baseModule = baseModule.replace(/MODULE_NAME/g, config.name);
    FS.writeFileSync(baseModuleDestination, baseModule);
}
exports.createModule = createModule;
function dasherise(input) {
    let output = input.replace(/([a-z0-9])([A-Z])/g, '$1-$2');
    output = output.replace(/[_\-\s]+/g, '-');
    output = output.toLowerCase();
    return output;
}
exports.dasherise = dasherise;
//# sourceMappingURL=index.js.map