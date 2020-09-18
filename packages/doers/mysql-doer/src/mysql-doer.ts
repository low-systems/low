import MySql from 'mysql';

import { Doer, IMap, TaskConfig, ConnectorContext } from 'low';

export class BitsToBoolsConversionError extends Error {
  constructor(message: string, public config: BitsToBoolsConfig, results: any[]) {
    super(message);
    Object.setPrototypeOf(this, BitsToBoolsConversionError);
  }
}

export class ScalarCastError extends Error {
  constructor(message: string, public value: any, public config: ScalarConfig) {
    super(message);
    Object.setPrototypeOf(this, ScalarCastError.prototype);
  }
}

export class ScalarResolutionError extends Error {
  constructor(message: string, public results: any[], public config: ScalarConfig) {
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

  handleResults(config: MySqlTaskConfig, error: MySql.MysqlError | null, results: any[], fields?: MySql.FieldInfo[]) {
    if (error) throw error;

    if (config.scalarConfig) {
      const scalar = this.resolveScalar(results, config.scalarConfig);
      return scalar;
    }

    if (config.bitsToBoolsConfigs) {
      this.bitsToBools(results, config.bitsToBoolsConfigs);
    }

    return { results, fields };
  }

  bitsToBools(results: any[], config: BitsToBoolsConfig | BitsToBoolsConfig[]) {
    const configs = Array.isArray(config) ? config : [config];

    let configIndex = 0;
    const configsLength = configs.length;

    //As these results sets may be huge, I'm using while loops for maximum performance.
    //Apologies for this not being as syntactically sweet as a for-of or forEach
    while (configIndex < configsLength) {
      const {fields, recordSetIndex} = configs[configIndex];

      //We might have one record set with all results in `results` or many record sets each with
      //their results in separate arrays within `results`
      const records = typeof recordSetIndex !== 'undefined' ? results[recordSetIndex] : results;

      if (!Array.isArray(records)) {
        throw new BitsToBoolsConversionError('Record set does not contain results ', configs[configIndex], results);
      }

      let recordIndex = 0;
      const recordsLength = records.length;
      const fieldsLength = fields.length;

      while (recordIndex < recordsLength) {
        let fieldIndex = 0;

        while (fieldIndex < fieldsLength) {
          if (Buffer.isBuffer(records[recordIndex][fields[fieldIndex]]) && records[recordIndex][fields[fieldIndex]].length === 1) {
            records[recordIndex][fields[fieldIndex]] = !!records[recordIndex][fields[fieldIndex]][0];
          }

          fieldIndex++;
        }

        recordIndex++;
      }

      configIndex++;
    }
  }

  resolveScalar(results: any[], config: ScalarConfig) {
    //We might have one record set with all results in `results` or many record sets each with
    //their results in separate arrays within `results`
    const recordSet = typeof config.recordSetIndex !== 'undefined' ? results[config.recordSetIndex] : results;

    if (!Array.isArray(recordSet)) {
      throw new ScalarResolutionError('Record set does not contain results', results, config);
    }

    if (recordSet.length !== 1) {
      throw new ScalarResolutionError('Record set contains more or less than one row', results, config);
    }

    const columns = Object.keys(recordSet[0]);
    if (columns.length !== 1) {
      throw new ScalarResolutionError('Cannot treat results with more or less than 1 column as a scalar results', results, config);
    }

    const value = recordSet[0][columns[0]];

    try {
      switch (config.type) {
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
      throw new ScalarCastError(err.message, value, config);
    }
  }
}

export interface MySqlTaskConfig {
  pool: string;
  query: string | MySql.QueryOptions;
  parameters?: any[];
  stringifyObjects?: boolean;
  bitsToBoolsConfigs?: BitsToBoolsConfig | BitsToBoolsConfig[];
  scalarConfig?: ScalarConfig;
}

export interface BitsToBoolsConfig {
  recordSetIndex?: number;
  fields: string[];
}

export interface ScalarConfig {
  recordSetIndex?: number;
  type: ScalarType;
}

export type ScalarType = 'boolean' | 'date' | 'json' | 'number' | 'string' | 'any';

export interface MySqlResponse {
  results: any;
  fields?: MySql.FieldInfo[];
}