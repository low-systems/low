import { ConnectorContext } from '../connectors/connector';
import { TaskConfig } from '../environment';
import { MultiDoerTask } from './multi-doer';
import { Doer } from './doer';
export declare class BranchDoer<C, S> extends Doer<C, S> {
    main(context: ConnectorContext<any>, taskConfig: TaskConfig, config: BranchDoerConfig): Promise<any>;
}
export interface BranchDoerConfig {
    which: string;
    branches: {
        [branch: string]: MultiDoerTask[];
    };
}
