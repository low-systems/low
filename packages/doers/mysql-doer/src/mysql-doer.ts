import MySql from 'mysql';

import { Doer, IMap, TaskConfig, ConnectorContext } from 'low';

export class MySqlDoer extends Doer<IMap<MySql.PoolConfig>, IMap<string>> {
  pools: IMap<MySql.Pool> = {};

  async setup() {
    Object.entries(this.config).forEach(([name, options]) => {
      if (name in this.secrets) {
        options.password = this.secrets[name] || options.password || undefined;
      }
      this.pools[name] = MySql.createPool(options);
    });
  }

  async main(context: ConnectorContext<any>, taskConfig: TaskConfig, config: MySqlTaskConfig): Promise<MySqlResponse> {
    const pool = this.pools[config.pool];

    if (!pool) {
      throw new Error(`Pool with name '${config.pool}' does not exist`);
    }

    const response = await new Promise<MySqlResponse>((resolve, reject) => {
      try {
        pool.query(config.query, config.parameters || [], (error, results, fields) => {
          if (error) {
            reject(error);
          } else {
            resolve({ results, fields });
          }
        });
      } catch(err) {
        reject(err);
      }
    });

    return response;
  }
}

export interface MySqlTaskConfig {
  pool: string;
  query: string | MySql.QueryOptions;
  parameters?: any[];
  stringifyObjects?: boolean;
}

export interface MySqlResponse {
  results: any;
  fields?: MySql.FieldInfo[]
}