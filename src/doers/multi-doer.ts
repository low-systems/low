import { Doer } from './doer';
import { BoundaryContext } from '../boundaries/boundary';
import { TaskConfig } from '../environment';
import { ObjectCompiler } from '../object-compiler';

export class MultiDoer extends Doer {
  async main(context: BoundaryContext, taskConfig: TaskConfig, multiDoerTasks: MultiDoerTask[]): Promise<any> {
    for (const multiDoerTask of multiDoerTasks) {
      const doer = this.env.getDoer(multiDoerTask.task.doer);
      await doer.execute(context, multiDoerTask.task);
      if (multiDoerTask.branch) {
        const branchConfig = await ObjectCompiler.compile(multiDoerTask.branch, context) as BranchConfig;
        if (!branchConfig.taskName) {
          throw new Error(`Invalid BranchConfig for task '${multiDoerTask.task.name}'`);
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
  task: TaskConfig;
  //TODO: Might this get a bit repetative? I know a `Pointer` can go here but
  //should I look at a set of overridable "All Task" rules for all tasks
  //run by a MultiDoer?
  branch?: any;
}

export interface BranchConfig {
  taskName: string;
  haltAfterExecution: boolean;
}