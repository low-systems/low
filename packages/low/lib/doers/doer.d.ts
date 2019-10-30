import { Module } from '../module';
import { TaskConfig } from '../environment';
import { BoundaryContext } from '../boundaries/boundary';
export declare class Doer extends Module {
    execute(context: BoundaryContext, task: TaskConfig): Promise<void>;
    main(context: BoundaryContext, taskConfig: TaskConfig, coreConfig: any): Promise<any>;
}
