import { Environment } from './environment';
import dot = require('dot-object');

export class BaseModule {
  readonly secrets: any = {};
  readonly config: any = {};
  get moduleType(): string {
    return this.constructor.name;
  }
  get debugPath(): string {
    return this.moduleType + '.' + this.name;
  }

  constructor(public readonly env: Environment, public readonly name: string, ...args: any[]) { 
    const globalSecrets = process.env.SECRETS && JSON.parse(process.env.SECRETS) || {};
    this.secrets = globalSecrets && globalSecrets[this.moduleType] && globalSecrets[this.moduleType][this.name] || {};
    this.config = env.moduleConfig && env.moduleConfig[this.moduleType] && env.moduleConfig[this.moduleType][this.name] || {}; 
  }

  destroy(): void { }

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