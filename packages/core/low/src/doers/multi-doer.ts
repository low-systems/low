import { Doer } from './doer';
import { ConnectorContext } from '../connectors/connector';
import { TaskConfig } from '../environment';
import { ObjectCompiler } from '../object-compiler';

export class MultiDoer<C, S> extends Doer<C, S> {
  async main(context: ConnectorContext<any>, taskConfig: TaskConfig, multiDoerTasks: MultiDoerTask[]): Promise<any> {
    this.env.debug(context, this.moduleType, 'Executing main(), returning');

    for (const multiDoerTask of multiDoerTasks) {
      let task: TaskConfig | undefined;

      if (typeof multiDoerTask.task === 'string') {
        this.env.debug(context, this.moduleType, `Finding task '${multiDoerTask.task}'`);
        task = this.env.getTask(multiDoerTask.task);
      } else {
        task = multiDoerTask.task;
      }

      if (multiDoerTask.compileTask) {
        task = await ObjectCompiler.compile(task, context);
      }

      if (!task) {
        this.env.debug(context, this.moduleType, `After compiling task there's nothing to do`);
        continue;
      }

      this.env.debug(context, this.moduleType, `Finding doer '${task.doer}'`);
      const doer = this.env.getDoer(task.doer);
      await doer.execute(context, task);

      context.lastTask = {
        task,
        input: context.calls[task.name] || null,
        output: context.data[task.name] || null,
        error: context.errors[task.name] || null
      };

      if (multiDoerTask.branch) {
        this.env.debug(context, this.moduleType, 'Task executed with BranchConfig, compiling it');
        const branchConfig = await ObjectCompiler.compile(multiDoerTask.branch, context) as BranchConfig;

        if (!branchConfig.taskName) {
          this.env.debug(context, this.moduleType, 'No branch task given so doing nothing');
        } else {
          this.env.debug(context, this.moduleType, `Branching to task '${branchConfig.taskName}'`);
          const branchTask = this.env.getTask(branchConfig.taskName);

          this.env.debug(context, this.moduleType, `Loading branch Doer '${branchTask.doer}'`);
          const branchDoer = this.env.getDoer(branchTask.doer);
          await branchDoer.execute(context, branchTask);
        }

        if (branchConfig.haltAfterExecution) {
          this.env.debug(context, this.moduleType, 'Halting after execution of Branch task');
          break;
        }
      }

      delete context.lastTask;
    }
  }
}

export interface MultiDoerTask {
  compileTask?: boolean;
  task: TaskConfig | string;
  branch?: any;
}

export interface BranchConfig {
  taskName?: string;
  haltAfterExecution?: boolean;
}