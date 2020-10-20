import { Module } from '../module';
import { TaskConfig } from '../environment';
import { ConnectorContext } from '../connectors/connector';
import { ObjectCompiler } from '../object-compiler';
import { CacheManager, CacheConfig, CacheKey } from '../cache-managers/cache-manager';

export class Doer<C, S> extends Module<C, S> {
  async execute(context: ConnectorContext<any>, task: TaskConfig): Promise<void> {
    try {
      const env = context.env;
      env.info(context, this.moduleType, `Executing task ${task.name}`);

      let cacheManager: CacheManager<any, any> | undefined;
      let cacheKey: CacheKey | undefined;

      context.calls[task.name] = { started: new Date(), config: task.config, finished: Number.MAX_VALUE };

      if (task.cacheConfig) {
        context.calls[task.name].cacheConfig = task.cacheConfig;

        env.info(context, this.moduleType, `Loading cache manager '${task.cacheConfig.cacheManager}`);
        cacheManager = this.env.getCacheManager(task.cacheConfig.cacheManager);
        cacheKey = await cacheManager.makeKey(task.cacheConfig, context);

        context.calls[task.name].cacheKey = cacheKey;

        const cachedItem = await cacheManager.getItem(cacheKey);

        context.calls[task.name].cacheHit = !!cachedItem;

        if (cachedItem) {
          env.info(context, 'Found cached item');
          env.debug(context, 'Found cached item', cachedItem);
          context.data[task.name] = cachedItem;
          context.calls[task.name].finished = new Date();
          env.profiler.profile(task.name, task.doer, false, true, context.calls[task.name].started, context.calls[task.name].finished, context.uid);
          return;
        }
      }

      const coreConfig = await ObjectCompiler.compile(task.config, context);
      context.calls[task.name].config = coreConfig;
      const output = await this.main(context, task, coreConfig);
      context.data[task.name] = output;

      if (cacheManager && cacheKey) {
        context.calls[task.name].cacheSet = `${cacheKey.partition}:${cacheKey.key} - TTL: ${(task.cacheConfig as CacheConfig).ttl}`;
        await cacheManager.setItem(cacheKey, output, (task.cacheConfig as CacheConfig).ttl);
      }

      context.calls[task.name].finished = new Date();
      env.profiler.profile(task.name, task.doer, false, false, context.calls[task.name].started, context.calls[task.name].finished, context.uid);
    } catch(err) {
      context.errors[task.name] = this.serialiseError(err);
      context.calls[task.name].finished = new Date();
      context.env.profiler.profile(task.name, task.doer, true, false, context.calls[task.name].started, context.calls[task.name].finished, context.uid);
      if (task.throwError) {
        throw err;
      }
    }
  }

  async main(context: ConnectorContext<any>, taskConfig: TaskConfig, coreConfig: any): Promise<any> {
    this.env.debug(context, this.moduleType, 'Executing main(), returning', coreConfig);
    return coreConfig
  }

  serialiseError(err: Error) {
    const jsonErr: any = {};
    Object.getOwnPropertyNames(err).forEach((key: any) => { jsonErr[key] = (err as any)[key]; } );
    return jsonErr;
  }
}