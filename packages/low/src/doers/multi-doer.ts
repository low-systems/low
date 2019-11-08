import { Doer } from './doer';
import { ConnectorContext } from '../connectors/connector';
import { TaskConfig } from '../environment';
import { ObjectCompiler } from '../object-compiler';

export class MultiDoer<C, S> extends Doer<C, S> {
  async main(context: ConnectorContext<any>, taskConfig: TaskConfig, multiDoerTasks: MultiDoerTask[]): Promise<any> {
    for (const multiDoerTask of multiDoerTasks) {
      const task = typeof multiDoerTask.task === 'string' ?
        this.env.getTask(multiDoerTask.task) :
        multiDoerTask.task;
      const doer = this.env.getDoer(task.doer);
      await doer.execute(context, task);
      if (multiDoerTask.branch) {
        const branchConfig = await ObjectCompiler.compile(multiDoerTask.branch, context) as BranchConfig;
        if (!branchConfig.taskName) {
          throw new Error(`Invalid BranchConfig for task '${task.name}'`);
        }

        const branchTask = this.env.getTask(branchConfig.taskName);
        const branchDoer = this.env.getDoer(branchTask.doer);
        await branchDoer.execute(context, branchTask);

        if (branchConfig.haltAfterExecution) {
          break;
        }
      }
    }
  }
}

export interface MultiDoerTask {
  task: TaskConfig | string;
  //TODO: Might this get a bit repetative? I know a `Pointer` can go here but
  //should I look at a set of overridable "All Task" rules for all tasks
  //run by a MultiDoer?
  branch?: any;
}

export interface BranchConfig {
  taskName: string;
  haltAfterExecution: boolean;
}