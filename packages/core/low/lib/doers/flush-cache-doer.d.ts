import { ConnectorContext } from '../connectors/connector';
import { TaskConfig } from '../environment';
import { Doer } from './doer';
export declare class FlushCacheDoer<C, S> extends Doer<C, S> {
    main(context: ConnectorContext<any>, taskConfig: TaskConfig, config: FlushCacheConfig): Promise<any>;
}
export interface FlushCacheConfig {
    cacheManager: string;
    partition: string;
}
