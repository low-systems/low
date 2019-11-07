import { CacheManager, CacheKey } from 'low';

export class CacheManagerMODULE_NAME extends CacheManager<MODULE_NAMEConfig, MODULE_NAMESecrets> {
  async setup() {
    console.warn('NOT YET IMPLEMENTED');
  }

  async getItem(cacheKey: CacheKey): Promise<any> {
    console.warn('NOT YET IMPLEMENTED');
  }

  async setItem(cacheKey: CacheKey, item: any, ttl: number): Promise<void> {
    console.warn('NOT YET IMPLEMENTED');
  }

  async flush(partition: string): Promise<void> {
    console.warn('NOT YET IMPLEMENTED');
  }

  async destroy() {
    console.warn('NOT YET IMPLEMENTED');
  }
}

export interface MODULE_NAMEConfig {
  PLACE_HOLDER: any;
}

export interface MODULE_NAMESecrets {
  PLACE_HOLDER: any;
}