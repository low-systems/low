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
    constructor(env, name, ...args) {
        super(env, name, ...args);
    }
    execute(job, taskConfig, path) {
        return __awaiter(this, void 0, void 0, function* () {
            //TODO: Check cache;
            const coreConfig = yield this.getCoreConfig(job, taskConfig);
            const response = yield this.core(job, taskConfig, coreConfig);
            const dataPath = 'data.' + path.join('.');
            dot.set(dataPath, response.data, job);
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
            if (Array.isArray(taskConfig.specialProperties)) {
                const coreConfig = JSON.parse(JSON.stringify(taskConfig.config));
                for (const path of taskConfig.specialProperties) {
                    const initial = dot.pick(path, coreConfig);
                    const applied = yield this.applySpecialProperties(initial, job);
                    dot.set(path, applied, coreConfig, false);
                }
                return coreConfig;
            }
        });
    }
    core(job, taskConfig, coreConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error(`Daer ${this.debugPath} has not yet implemented core(Job, TaskConfig)`);
        });
    }
    applySpecialProperties(property, job) {
        return __awaiter(this, void 0, void 0, function* () {
            const propertyType = this.getPropertyType(property);
            switch (propertyType) {
                case (PropertyType.BORING):
                    return yield this.applyBoringProperty(property, job);
                case (PropertyType.POINTER):
                    return yield this.applyPointerProperty(property, job);
                case (PropertyType.RENDERER):
                    return yield this.applyRenderProperty(property, job);
            }
            return property;
        });
    }
    applyBoringProperty(property, job) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Array.isArray(property)) {
                const applied = [];
                for (const item of property) {
                    const itemApplied = yield this.applySpecialProperties(item, job);
                    applied.push(itemApplied);
                }
                return applied;
            }
            else if (typeof property === 'object') {
                const applied = {};
                for (const [key, value] of Object.entries(property)) {
                    const valueApplied = yield this.applySpecialProperties(value, job);
                    applied[key] = value;
                }
                return applied;
            }
            return property;
        });
    }
    applyPointerProperty(property, job) {
        return __awaiter(this, void 0, void 0, function* () {
            const resolved = this.resolvePointer(property, this.env, job);
            const applied = yield this.applySpecialProperties(resolved, job);
            return applied;
        });
    }
    applyRenderProperty(property, job) {
        return __awaiter(this, void 0, void 0, function* () {
            const renderConfig = property;
            if (!this.env.renderers.hasOwnProperty(renderConfig.renderer)) {
                throw new Error(`The task ${this.debugPath} has a special property which is attempting to use an unknown renderer called "${renderConfig.renderer}"`);
            }
            const renderer = this.env.renderers[renderConfig.renderer];
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
            property.hasOwnProperty('renderer') &&
            (property.hasOwnProperty('template') ||
                property.hasOwnProperty('templatePath'))) {
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