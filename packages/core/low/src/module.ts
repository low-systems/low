import { Environment } from './environment';

export class Module<C, S> {
  private _env: Environment | undefined;
  get env(): Environment {
    if (!this._env) {
      throw new Error('No Environment has been set. Has this Module been setup correctly?');
    }
    return this._env;
  }

  private _config: C | undefined;
  get config(): C {
    if (!this._config) {
      throw new Error('No Config have been set. Has this Module been setup correctly?');
    }
    return this._config;
  }

  private _secrets: S | undefined;
  get secrets(): S {
    if (!this._secrets) {
      throw new Error('No Secrets have been set. Has this Module been setup correctly?');
    }
    return this._secrets;
  }

  get moduleType(): string {
    return this.constructor.name;
  }

  private _ready: boolean = false;
  get isReady(): boolean {
    return this._ready;
  }

  async init(env: Environment): Promise<void> {
    if (this._ready) {
      await this.destroy();
      this._ready = false;
    }
    this._env = env;
    this._config = env.config.modules && env.config.modules[this.moduleType] || {};
    this._secrets = env.secrets.modules && env.secrets.modules[this.moduleType] || {};
    await this.setup();
    this._ready = true;
  }

  async setup(): Promise<void> { return; };
  async destroy(): Promise<void> { return; };
}