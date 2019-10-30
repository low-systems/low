import { Module } from '../module';
import { Context, TaskConfig } from '../environment';
export declare class Boundary extends Module {
    setup(): Promise<void>;
    setupTask(task: TaskConfig, config: any): Promise<void>;
    runTask(task: TaskConfig, input: any, config: any): Promise<BoundaryContext>;
}
export interface BoundaryContext extends Context {
    boundary: {
        input: any;
        config: any;
    };
    data: any;
    errors: {
        [taskName: string]: Error;
    };
}
