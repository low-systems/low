import { Environment } from './environment';

export class Module {
  private _env: Environment | undefined;
  public get env(): Environment {
    if (!this._env) {
      throw new Error('No Environment has been set. Has this Module been setup correctly');
    }
    return this._env;
  }

  secrets: any = {};
  config: any = {};

  get moduleType(): string {
    return this.constructor.name;
  }

  protected ready: boolean = false;
  get isReady(): boolean {
    return this.ready;
  }

  constructor(...args: any[]) { }

  async init(env: Environment): Promise<void> {
    if (this.ready) {
      this.destroy();
      this.ready = false;
    }
    this._env = env;
    this.config = env.config.modules && env.config.modules[this.moduleType] || {};
    this.secrets = env.secrets.modules && env.secrets.modules[this.moduleType] || {};
    await this.setup();
    this.ready = true;
  }

  async setup(): Promise<void> { };
  async destroy(): Promise<void> { };
}