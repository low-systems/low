import { Doer } from './doer';
import { BoundaryContext } from '../boundaries/boundary';
import { TaskConfig } from '../environment';

export class MultiDoer extends Doer {
  async main(context: BoundaryContext, taskConfig: TaskConfig, tasks: TaskConfig[]): Promise<any> {
    for (const task of tasks) {
      const doer = this.env.getDoer(task.doer);
      await doer.execute(context, task);
    }
  }
}