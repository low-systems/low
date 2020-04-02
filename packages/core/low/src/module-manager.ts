import { IMap } from ".";
import { Module } from "./module";

export class ModuleManager extends Module {
  private modules: IMap<Module> = {};

  registerModule(mod: Module) {
    const moduleType = mod.moduleType;

    if (!this.isReady) {
      throw new Error(`Cannot register module '${moduleType}'. The ModuleManager is not ready. Has the environment been initialised?`);
    }

    if (this.modules.hasOwnProperty(moduleType)) {
      throw new Error(`The Module '${moduleType}' is already registered. Set 'overwrite' to 'true' to re-register it`);
    }

    this.modules[moduleType] = mod;
  }

  async initModule(moduleType: string, ...initArgs: any[]) {
    if (!this.isReady) {
      throw new Error(`Cannot initialise module '${moduleType}'. The ModuleManager is not ready. Has the environment been initialised?`);
    }

    const mod: Module = this.getModule(moduleType);
    await mod.init(this.env, ...initArgs);
  }

  getModule<T extends Module>(moduleType: string) {
    if (!this.isReady) {
      throw new Error(`Cannot get module '${moduleType}'. The ModuleManager is not ready. Has the environment been initialised?`);
    }

    if (!this.modules[moduleType].hasOwnProperty(moduleType)) {
      throw new Error(`The Module '${moduleType}' is not registered`);
    }

    if (!this.modules[moduleType].isReady) {
      throw new Error(`The Module '${moduleType}' is loaded but not ready. Has the environment been initialised?`);
    }

    return this.modules[moduleType] as T;
  }

  getModules<T extends Module = Module>(mod?: T) {
    if (!this.isReady) {
      throw new Error(`Cannot get modules. The ModuleManager is not ready. Has the environment been initialised?`);
    }

    const mods = Object.values(this.modules);
    if (!mod) {
      return mods as T[];
    } else {
      const found = mods.filter((item: Module) => item.isPrototypeOf(mod));
      return found as T[];
    }
  }

  async destroy() {
    for (const mod of Object.values(this.modules)) {
      await mod.destroy();
    }
  }
}