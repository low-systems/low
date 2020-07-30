import { ConnectorContext } from '../connectors/connector';
import { TaskConfig } from '../environment';
import { MultiDoerTask } from './multi-doer';
import { Doer } from './doer';

export class BranchDoer<C, S> extends Doer<C, S> {
  async main(context: ConnectorContext<any>, taskConfig: TaskConfig, config: BranchDoerConfig): Promise<any> {
    if (!(config.which in config.branches)) {
      throw new Error(`Invalid branch name '${config.which}'`);
    }

    const branchTasks = config.branches[config.which];
    const multiDoer = this.env.getDoer('MultiDoer');
    return await multiDoer.main(context, taskConfig, branchTasks);
  }
}

export interface BranchDoerConfig {
  which: string;
  branches: { [branch: string]: MultiDoerTask[] };
}