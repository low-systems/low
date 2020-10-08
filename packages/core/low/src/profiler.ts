export class Profiler implements ProfilerConfig {
  enabled = false;
  size = 10000;
  private _items: ProfilerItem[] = [];
  get items() { return this._items; }

  constructor(config?: ProfilerConfig) {
    if (config) {
      Object.assign(this, config);
    }
  }

  profile(task: string, doer: string, hasError: boolean, fromCache: boolean, start: Date, end: Date, requestId: string = 'ENV') {
    if (!this.enabled) return;
    try {
      this._items.push({
        requestId, task, doer, hasError, fromCache,
        start: start.toISOString(),
        end: end.toISOString(),
        executionTimeMs: end.getTime() - start.getTime()
      });
      if (this._items.length > this.size) {
        const toRemove = this._items.length - this.size;
        this._items.splice(0, toRemove);
      }
    } catch (err) {
      console.error(`Profiler failed: ${err.message}`);
    }
  }
}

export interface ProfilerConfig {
  enabled: boolean;
  size: number;
}

export interface ProfilerItem {
  requestId: string;
  task: string;
  doer: string;
  hasError: boolean;
  fromCache: boolean;
  start: string;
  end: string;
  executionTimeMs: number;
}