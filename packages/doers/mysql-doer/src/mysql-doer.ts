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
            if (config.convertBitsToBools) {
              const fieldNames = Array.isArray(config.convertBitsToBools) ? config.convertBitsToBools :
                typeof config.convertBitsToBools === 'string' ? [config.convertBitsToBools] :
                fields && fields.map((field) => field.name) || []; //TODO: Check that this will never be field.orgName
              this.convertBitsToBools(results, fieldNames);
            }
            resolve({ results, fields });
          }
        });
      } catch(err) {
        reject(err);
      }
    });

    return response;
  }

  //TODO: Make this work for multiple record sets
  convertBitsToBools(results: any[], fieldNames: string[]) {
    //As these results sets may be huge, I'm using while loops for maximum performance.
    //Apologies for this not being as syntactically sweet as a for-of or forEach
    let r = 0;
    const resultsLength = results.length;
    const fieldNamesLength = fieldNames.length;
    while (r < resultsLength) {
      let f = 0;
      while (f < fieldNamesLength) {
        if (Buffer.isBuffer(results[r][fieldNames[f]])) {
          results[r][f] = !!results[r][fieldNames[f]][0];
        }
        f++;
      }
      r++;
    }
  }
}

export interface MySqlTaskConfig {
  pool: string;
  query: string | MySql.QueryOptions;
  parameters?: any[];
  stringifyObjects?: boolean;
  convertBitsToBools?: boolean | string | string[];
}

export interface MySqlResponse {
  results: any;
  fields?: MySql.FieldInfo[]
}