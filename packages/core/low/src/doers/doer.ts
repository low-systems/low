import { Module } from '../module';
import { TaskConfig } from '../task-manager';
import { ConnectorContext } from '../connectors/connector';
import { ObjectCompiler } from '../object-compiler';
import { CacheManager, CacheConfig, CacheKey } from '../cache-managers/cache-manager';

export class Doer extends Module {
  async execute(context: ConnectorContext<any>, task: TaskConfig): Promise<void> {
    try {
      const env = context.env;
      env.info(context, this.moduleType, `Executing task ${task.name}`);

      let cacheManager: CacheManager | undefined;
      let cacheKey: CacheKey | undefined;

      if (task.cacheConfig) {
        env.info(context, this.moduleType, `Loading cache manager '${task.cacheConfig.cacheManager}`);
        cacheManager = this.env.moduleManager.getModule<CacheManager>(task.cacheConfig.cacheManager);
        cacheKey = await cacheManager.makeKey(task.cacheConfig, context);

        const cachedItem = await cacheManager.getItem(cacheKey);

        if (cachedItem) {
          env.info(context, 'Found cached item');
          env.debug(context, 'Found cached item', cachedItem);
          context.data[task.name] = cachedItem;
          return;
        }
      }

      const coreConfig = await ObjectCompiler.compile(task.config, context);
      const output = await this.main(coreConfig);
      context.data[task.name] = output;

      if (cacheManager && cacheKey) {
        await cacheManager.setItem(cacheKey, output, (task.cacheConfig as CacheConfig).ttl);
      }
    } catch(err) {
      context.errors[task.name] = err;
      if (task.throwError) {
        throw err;
      }
    }
  }

  main(input: any): Promise<any> {
    return input;
  }
}