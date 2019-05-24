import { Environment } from './environment';
import dot = require('dot-object');

export abstract class BaseModule {
  private _env: Environment | undefined;

  public get env(): Environment {
    if (!this._env) {
      throw new Error('No Environment has been set. Has this Module been setup correctly');
    }
    return this._env;
  }

  protected secrets: any = {};
  protected config: any = {};
  protected ready: boolean = false;

  get moduleType(): string {
    return this.constructor.name;
  }
  get debugPath(): string {
    return this.moduleType + '.' + this.name;
  }

  constructor(public readonly name: string, ...args: any[]) { 
    this.loadGlobalSecrets();
  }

  private loadGlobalSecrets(): void {
    const globalSecrets = process.env.SECRETS && JSON.parse(process.env.SECRETS) || {};
    this.secrets = globalSecrets && globalSecrets[this.moduleType] && globalSecrets[this.moduleType][this.name] || {};
  }

  async triggerSetup(env: Environment): Promise<void> {
    if (this.ready) {
      this.destroy();
      this.ready = false;
    }
    this.loadGlobalSecrets();
    this._env = env; 
    this.config = env.moduleConfigs && env.moduleConfigs[this.moduleType] && env.moduleConfigs[this.moduleType][this.name] || {};
    await this.setup();
    this.ready = true;
  }

  async setup(): Promise<void> { };
  async destroy(): Promise<void> { };

  resolvePointer(pointer: string, ...args: any[]): any {
    const path = pointer.substr(1);
    for (const arg of args) {
      const value = dot.pick(path, arg);
      if (typeof value !== 'undefined') {
        return value;
      }
    }
    throw new Error(`Pointer "${pointer}" could not be resolved`);
  }
}