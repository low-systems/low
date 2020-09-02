import { ConnectorContext } from '../connectors/connector';
import { TaskConfig } from '../environment';
import { Doer } from './doer';

export class FlushCacheDoer<C, S> extends Doer<C, S> {
  async main(context: ConnectorContext<any>, taskConfig: TaskConfig, config: FlushCacheConfig): Promise<any> {
    const cacheManager = this.env.getCacheManager(config.cacheManager);
    await cacheManager.flush(config.partition);
  }
}

export interface FlushCacheConfig {
  cacheManager: string;
  partition: string;
}