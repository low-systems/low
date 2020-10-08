"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Profiler {
    constructor(config) {
        this.enabled = false;
        this.size = 10000;
        this._items = [];
        if (config) {
            Object.assign(this, config);
        }
    }
    get items() { return this._items; }
    profile(task, doer, hasError, fromCache, start, end, requestId = 'ENV') {
        if (!this.enabled)
            return;
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
        }
        catch (err) {
            console.error(`Profiler failed: ${err.message}`);
        }
    }
}
exports.Profiler = Profiler;
//# sourceMappingURL=profiler.js.map