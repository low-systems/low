import { Module } from '../module';
import { TaskConfig } from '../environment';
import { ConnectorContext } from '../connectors/connector';
import { ObjectCompiler } from '../object-compiler';
import { CacheManager, CacheConfig, CacheKey } from '../cache-managers/cache-manager';

export class Doer<C, S> extends Module<C, S> {
  async execute(context: ConnectorContext, task: TaskConfig): Promise<void> {
    try {
      let cacheManager: CacheManager<any, any> | undefined;
      let cacheKey: CacheKey | undefined;

      if (task.cacheConfig) {
        cacheManager = this.env.getCacheManager(task.cacheConfig.cacheManager);
        cacheKey = await cacheManager.makeKey(task.cacheConfig, context);
        const cachedItem = await cacheManager.getItem(cacheKey);
        if (cachedItem) {
          context.data[task.name] = cachedItem;
          return;
        }
      }

      const coreConfig = await ObjectCompiler.compile(task.config, context);
      const output = await this.main(context, task, coreConfig);
      context.data[task.name] = output;

      if (cacheManager && cacheKey) {
        await cacheManager.setItem(cacheKey, output, (task.cacheConfig as CacheConfig).ttl);
      }
    } catch(err) {
      context.errors[task.name] = err;
    }
  }

  async main(context: ConnectorContext, taskConfig: TaskConfig, coreConfig: any): Promise<any> {
    return coreConfig
  }
}