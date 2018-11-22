"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_module_1 = require("../base-module");
const dot = require("dot-object");
class BaseDaer extends base_module_1.BaseModule {
    execute(job, taskConfig, path = []) {
        return __awaiter(this, void 0, void 0, function* () {
            path.push(taskConfig.name);
            const dataPath = 'data.' + path.join('.');
            let cacheManager;
            let cacheKey;
            if (taskConfig.cacheConfig) {
                cacheManager = this.env.getCacheManager(taskConfig.cacheConfig.cacheManager);
                cacheKey = yield cacheManager.makeKey(taskConfig.cacheConfig, job);
                const cachedItem = yield cacheManager.getItem(cacheKey);
                if (cachedItem) {
                    //console.log('Setting data from cache for:', this.debugPath, '(\n', cachedItem, '\n)');
                    dot.set(dataPath, cachedItem, job, true);
                    return;
                }
            }
            const coreConfig = yield this.getCoreConfig(job, taskConfig);
            const response = yield this.core(job, taskConfig, coreConfig, path);
            //console.log('Setting data for:', this.debugPath, '(\n', response.data, '\n)');
            dot.set(dataPath, response.data, job, true);
            if (cacheManager && cacheKey) {
                yield cacheManager.setItem(cacheKey, response.data, taskConfig.cacheConfig.ttl);
            }
        });
    }
    getCoreConfig(job, taskConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!taskConfig.specialProperties) {
                return taskConfig.config;
            }
            if (taskConfig.specialProperties === '*') {
                const coreConfig = yield this.applySpecialProperties(taskConfig.config, job);
                return coreConfig;
            }
            const include = taskConfig.specialProperties.include || taskConfig.specialProperties || [];
            const exclude = taskConfig.specialProperties.exclude || [];
            const coreConfig = JSON.parse(JSON.stringify(taskConfig.config));
            for (const path of include) {
                const initial = dot.pick(path, coreConfig);
                const applied = yield this.applySpecialProperties(initial, job, exclude, path.split('.'));
                dot.set(path, applied, coreConfig, false);
            }
            return coreConfig;
        });
    }
    applySpecialProperties(property, job, exclude = [], path = []) {
        return __awaiter(this, void 0, void 0, function* () {
            const propertyType = this.getPropertyType(property);
            switch (propertyType) {
                case (PropertyType.BORING):
                    return yield this.applyBoringProperty(property, job, exclude, path);
                case (PropertyType.POINTER):
                    return yield this.applyPointerProperty(property, job, exclude, path);
                case (PropertyType.RENDERER):
                    return yield this.applyRenderProperty(property, job);
            }
            return property;
        });
    }
    applyBoringProperty(property, job, exclude, path) {
        return __awaiter(this, void 0, void 0, function* () {
            // QUESTION: Do I roll this into one statement and do the isArray then push else [key]= inside the for loop?
            // Probably slower to do that way but the code would be cleaner.
            if (Array.isArray(property)) {
                const applied = [];
                for (const [index, item] of Object.entries(property)) {
                    const newPath = [...path, index];
                    const newPathString = newPath.join('.');
                    if (exclude.indexOf(newPathString) === -1) {
                        const itemApplied = yield this.applySpecialProperties(item, job, exclude, [...path, index]);
                        applied.push(itemApplied);
                    }
                }
                return applied;
            }
            else if (typeof property === 'object') {
                const applied = {};
                for (const [key, value] of Object.entries(property)) {
                    const newPath = [...path, key];
                    const newPathString = newPath.join('.');
                    if (exclude.indexOf(newPathString) === -1) {
                        const valueApplied = yield this.applySpecialProperties(value, job, exclude, newPath);
                        applied[key] = value;
                    }
                }
                return applied;
            }
            return property;
        });
    }
    applyPointerProperty(property, job, exclude, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const resolved = this.resolvePointer(property, this.env, job);
            const applied = yield this.applySpecialProperties(resolved, job, exclude, path);
            return applied;
        });
    }
    applyRenderProperty(property, job) {
        return __awaiter(this, void 0, void 0, function* () {
            const renderConfig = property;
            const renderer = this.env.getRenderer(renderConfig._renderer);
            const rendered = renderer.render(renderConfig, job);
            return rendered;
        });
    }
    getPropertyType(property) {
        if (typeof property === 'string' &&
            property.indexOf('>') === 0 &&
            property.indexOf('\n') === -1) {
            return PropertyType.POINTER;
        }
        else if (typeof property === 'object' &&
            property.hasOwnProperty('_renderer') &&
            (property.hasOwnProperty('_template') ||
                property.hasOwnProperty('_templatePath'))) {
            return PropertyType.RENDERER;
        }
        return PropertyType.BORING;
    }
}
exports.BaseDaer = BaseDaer;
var PropertyType;
(function (PropertyType) {
    PropertyType[PropertyType["BORING"] = 0] = "BORING";
    PropertyType[PropertyType["POINTER"] = 1] = "POINTER";
    PropertyType[PropertyType["RENDERER"] = 2] = "RENDERER";
})(PropertyType = exports.PropertyType || (exports.PropertyType = {}));
//# sourceMappingURL=base-daer.js.map