import { TaskConfig, TaskResponse, SpecialProperties } from '../interfaces';
import { BaseModule } from '../base-module';
import { BaseRenderer, RenderConfig } from '../renderers/base-renderer';
import { Environment, Job } from '../environment';
import { BaseCacheManager, CacheConfig, CacheKey } from '../cache-managers/base-cache-manager';

import dot = require('dot-object');

export abstract class BaseDaer extends BaseModule {
  async execute(job: Job, taskConfig: TaskConfig, path: string[] = []): Promise<void> {
    path.push(taskConfig.name);

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

    const include = (taskConfig.specialProperties as SpecialProperties).include || taskConfig.specialProperties || [];
    const exclude = (taskConfig.specialProperties as SpecialProperties).exclude || [];

    const coreConfig = JSON.parse(JSON.stringify(taskConfig.config));
    for (const path of include) {
      const initial = dot.pick(path, coreConfig);
      const applied = await this.applySpecialProperties(initial, job, exclude, path.split('.'));
      dot.set(path, applied, coreConfig, false);
    }
    return coreConfig;
  }

  async core(job: Job, taskConfig: TaskConfig, coreConfig: any): Promise<TaskResponse> {
    throw new Error(`Daer ${this.debugPath} has not yet implemented core(Job, TaskConfig)`);
  }

  async applySpecialProperties(property: any, job: Job, exclude: string[] = [], path: string[] = []): Promise<any> {
    const propertyType = this.getPropertyType(property);

    switch (propertyType) {
      case (PropertyType.BORING):
        return await this.applyBoringProperty(property, job, exclude, path);
      case(PropertyType.POINTER):
        return await this.applyPointerProperty(property, job, exclude, path);
      case(PropertyType.RENDERER):
        return await this.applyRenderProperty(property, job);
    }

    return property;
  }

  async applyBoringProperty(property: any, job: Job, exclude: string[], path: string[]): Promise<any> {
    // QUESTION: Do I roll this into one statement and do the isArray then push else [key]= inside the for loop?
    // Probably slower to do that way but the code would be cleaner.
    if (Array.isArray(property)) {
      const applied: any[] = [];
      for (const [index, item] of Object.entries(property)) {
        const newPath = [...path, index];
        const newPathString = newPath.join('.');
        if (exclude.indexOf(newPathString) === -1) {
          const itemApplied = await this.applySpecialProperties(item, job, exclude, [...path, index]);
          applied.push(itemApplied);
        }
      }
      return applied;
    } else if (typeof property === 'object') {
      const applied: any = {};
      for (const [key, value] of Object.entries(property)) {
        const newPath = [...path, key];
        const newPathString = newPath.join('.');
        if (exclude.indexOf(newPathString) === -1) {
          const valueApplied = await this.applySpecialProperties(value, job, exclude, newPath);
          applied[key] = value;
        }
      }
      return applied;
    }
    return property;
  }

  async applyPointerProperty(property: any, job: Job, exclude: string[], path: string[]): Promise<any> {
    const resolved = this.resolvePointer(property, this.env, job);
    const applied = await this.applySpecialProperties(resolved, job, exclude, path);
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