import { TaskConfig, TaskResponse } from '../interfaces';
import { BaseModule } from '../base-module';
import { BaseRenderer, RenderConfig } from '../renderers/base-renderer';
import { Environment, Job } from '../environment';
import { BaseCacheManager, CacheConfig, CacheKey } from '../cache-managers/base-cache-manager';

import dot = require('dot-object');

export abstract class BaseDaer extends BaseModule {
  constructor(name: string, ...args: any[]) { 
    super(name, ...args);
  }

  async execute(job: Job, taskConfig: TaskConfig, path: string[]): Promise<void> {
    let cacheManager: BaseCacheManager | undefined;
    let cacheKey: CacheKey | undefined;

    if (taskConfig.cacheConfig) {
      cacheManager = this.env.getCacheManager(taskConfig.cacheConfig.cacheManager);  
      cacheKey = await cacheManager.makeKey(taskConfig.cacheConfig, job);
      const cachedItem = await cacheManager.getItem(cacheKey);
      if (cachedItem) {
        return cachedItem;
      }
    }
    
    const coreConfig = await this.getCoreConfig(job, taskConfig);
    const response = await this.core(job, taskConfig, coreConfig);

    const dataPath = 'data.' + path.join('.');
    dot.set(dataPath, response.data, job);

    if (cacheManager && cacheKey) {
      await cacheManager.setItem(cacheKey, response.data, (taskConfig.cacheConfig as CacheConfig).ttl);
    }
  }
  
  async getCoreConfig(job: Job, taskConfig: TaskConfig): Promise<void> {
    if (!taskConfig.specialProperties) {
      return taskConfig.config;
    }

    if (taskConfig.specialProperties === '*') {
      const coreConfig = await this.applySpecialProperties(taskConfig.config, job);
      return coreConfig;
    }

    if (Array.isArray(taskConfig.specialProperties)) {
      const coreConfig = JSON.parse(JSON.stringify(taskConfig.config));
      for (const path of taskConfig.specialProperties) {
        const initial = dot.pick(path, coreConfig);
        const applied = await this.applySpecialProperties(initial, job);
        dot.set(path, applied, coreConfig, false);
      }
      return coreConfig;
    }
  }

  async core(job: Job, taskConfig: TaskConfig, coreConfig: any): Promise<TaskResponse> {
    throw new Error(`Daer ${this.debugPath} has not yet implemented core(Job, TaskConfig)`);
  }

  async applySpecialProperties(property: any, job: Job): Promise<any> {
    const propertyType = this.getPropertyType(property);

    switch (propertyType) {
      case (PropertyType.BORING):
        return await this.applyBoringProperty(property, job);
      case(PropertyType.POINTER):
        return await this.applyPointerProperty(property, job);
      case(PropertyType.RENDERER):
        return await this.applyRenderProperty(property, job);
    }

    return property;
  }

  async applyBoringProperty(property: any, job: Job): Promise<any> {
    if (Array.isArray(property)) {
      const applied: any[] = [];
      for (const item of property) {
        const itemApplied = await this.applySpecialProperties(item, job);
        applied.push(itemApplied);
      }
      return applied;
    } else if (typeof property === 'object') {
      const applied: any = {};
      for (const [key, value] of Object.entries(property)) {
        const valueApplied = await this.applySpecialProperties(value, job);
        applied[key] = value;
      }
      return applied;
    }
    return property;
  }

  async applyPointerProperty(property: any, job: Job): Promise<any> {
    const resolved = this.resolvePointer(property, this.env, job);
    const applied = await this.applySpecialProperties(resolved, job);
    return applied;
  }

  async applyRenderProperty(property: any, job: Job): Promise<any> {
    const renderConfig = property as RenderConfig;
    const renderer = this.env.getRenderer(renderConfig.renderer);
    const rendered = renderer.render(renderConfig, job);
    return rendered;
  }

  getPropertyType(property: any): PropertyType {
    if (typeof property === 'string' &&
        (property as string).indexOf('>') === 0 &&
        (property as string).indexOf('\n') === -1) {
      return PropertyType.POINTER;      
    } else if (typeof property === 'object' &&
        property.hasOwnProperty('renderer') &&
        (
          property.hasOwnProperty('template') ||
          property.hasOwnProperty('templatePath')
        )){ 
      return PropertyType.RENDERER;
    }

    return PropertyType.BORING;
  }
}

export enum PropertyType {
  BORING,
  POINTER,
  RENDERER
}