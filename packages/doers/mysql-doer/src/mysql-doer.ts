import MySql from 'mysql';

import { Doer, IMap, TaskConfig, ConnectorContext } from 'low';

export class ScalarCastError extends Error {
  constructor(message: string, public value: any, public type: ScalarType) {
    super(message);
    Object.setPrototypeOf(this, ScalarCastError.prototype);
  }
}

export class ScalarResolutionError extends Error {
  constructor(message: string, public results: any[], public type: ScalarType) {
    super(message);
    Object.setPrototypeOf(this, ScalarResolutionError.prototype);
  }
}

export class MySqlDoer extends Doer<IMap<MySql.PoolConfig>, IMap<string>> {
  pools: IMap<MySql.Pool> = {};

  async setup() {
    Object.entries(this.config).forEach(([name, options]) => {
      if (name in this.secrets && this.secrets[name]) {
        options.password = this.secrets[name];
      }
      this.pools[name] = MySql.createPool(options);
    });
  }

  main(context: ConnectorContext<any>, taskConfig: TaskConfig, config: MySqlTaskConfig): Promise<MySqlResponse> {
    return new Promise<MySqlResponse>((resolve, reject) => {
      const pool = this.pools[config.pool];

      if (!pool) {
        reject(new Error(`Pool with name '${config.pool}' does not exist`));
      }

      pool.query(config.query, config.parameters || [], (error, results, fields) => {
        try {
          resolve(this.handleResults(config, error, results, fields))
        } catch(err) {
          reject(err);
        }
      });
    });
  }

  handleResults(config: MySqlTaskConfig, error: MySql.MysqlError | null, results: any[], fields?: MySql.FieldInfo[] | MySql.FieldInfo[][]) {
    if (error) throw error;

    if (config.convertBitsToBools) {
      this.bitsToBools(results, config.convertBitsToBools, fields);
    }

    if (config.scalarType) {
      const scalar = this.resolveScalar(results, config.scalarType, fields);
      return scalar;
    } else {
      return { results, fields };
    }
  }

  bitsToBools(results: any[], fieldNames: string[], fields?: MySql.FieldInfo[] | MySql.FieldInfo[][]) {
    if (!fields) {
      throw new Error('Cannot convert bits to bools as there appears to be no Field info');
    }

    if (Array.isArray(fields[0])) {
      throw new Error('Cannot convert bits to bools on multiple record sets yet, sorry!');
    }

    //As these results sets may be huge, I'm using while loops for maximum performance.
    //Apologies for this not being as syntactically sweet as a for-of or forEach

    if (fieldNames.length) {
      let r = 0;
      const resultsLength = results.length;
      const fieldNamesLength = fieldNames.length;
      while (r < resultsLength) {
        let f = 0;
        while (f < fieldNamesLength) {
          if (Buffer.isBuffer(results[r][fieldNames[f]])) {
            results[r][fieldNames[f]] = !!results[r][fieldNames[f]][0];
          }
          f++;
        }
        r++;
      }
    }
  }

  resolveScalar(results: any[], type: ScalarType, fields?: MySql.FieldInfo[] | MySql.FieldInfo[][]) {
    if (!fields) {
      throw new ScalarResolutionError('Cannot resolve scalar value as there appears to be no Field info', results, type);
    }

    if (Array.isArray(fields[0])) {
      throw new ScalarResolutionError('Cannot treat multiple record sets as a scalar result', results, type);
    }

    if (results.length !== 1) {
      throw new ScalarResolutionError('Cannot treat results with more or less than 1 row as a scalar result', results, type);
    }

    const columns = Object.keys(results[0]);
    if (columns.length !== 1) {
      throw new ScalarResolutionError('Cannot treat results with more or less than 1 column as a scalar results', results, type);
    }

    const value = results[0][columns[0]];

    try {
      switch (type) {
        case ('boolean'):
          if (Buffer.isBuffer(value)) {
            return !!value[0];
          } else {
            return Boolean(value);
          }
        case ('date'):
          return new Date(value);
        case ('json'):
          return JSON.parse(value);
        case ('number'):
          return Number(value);
        case ('string'):
          return '' + value;
        default:
          return value;
      }
    } catch (err) {
      throw new ScalarCastError(err.message, value, type);
    }
  }
}

export interface MySqlTaskConfig {
  pool: string;
  query: string | MySql.QueryOptions;
  parameters?: any[];
  stringifyObjects?: boolean;
  convertBitsToBools?: string[];
  scalarType?: ScalarType;
}

export type ScalarType = 'boolean' | 'date' | 'json' | 'number' | 'string' | 'any';

export interface MySqlResponse {
  results: any;
  fields?: MySql.FieldInfo[];
}