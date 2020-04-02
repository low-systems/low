import { Environment } from './environment';

export class Module {
  private _env: Environment | undefined;
  get env(): Environment {
    if (!this._env) {
      throw new Error('No Environment has been set. Has this Module been setup correctly?');
    }
    return this._env;
  }

  get moduleType() { return this.constructor.name; }

  private _ready: boolean = false;
  get isReady(): boolean {
    return this._ready;
  }

  async init(env: Environment, ...initArgs: any[]): Promise<void> {
    env.debug(null, this.moduleType, `Initialising`);

    if (this._ready) {
      env.warn(null, this.moduleType, 'Module already initialised. Destroying and re-initialising');
      await this.destroy();
      this._ready = false;
    }

    this._env = env;

    await this.setup(...initArgs);
    this._ready = true;

    env.debug(null, this.moduleType, `Module ready`);
  }

  async setup(...initArgs: any[]): Promise<void> { return; };
  async destroy(): Promise<void> { return; };
}