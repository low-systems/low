import DeepMerge from 'deepmerge';

import Ajv, { Options as AjvOptions, SchemaObject, ValidateFunction } from 'ajv';
import JsonSchema, { JSONSchema4, JSONSchema7Type } from 'json-schema';
import AjvErrors from 'ajv-errors';
import AjvKeywords from 'ajv-keywords';

import { Doer, TaskConfig, ConnectorContext, MultiDoerTask, IMap } from 'low';

const AJV_OPTIONS: AjvOptions = {
  allErrors: true,
  coerceTypes: true,
  $data: true,
  strict: false,
  //jsonPointers: true,
  //errorDataPath: 'property'
}

const PART_DEFAULT_DATA: FormatPartData = {
  metadata: {},
  path: '',
  template: '${allParts}',
  type: 'object'
}

export class SchemaDoer extends Doer<any, any> {
  schemaRegistry = new Map<string, SchemaValidator>();
  partsRegistry: FormatPart = this.createPart({ $part: PART_DEFAULT_DATA });

  private _ajv?: Ajv;
  public get ajv() {
    if (!this._ajv) {
      this._ajv = new Ajv(AJV_OPTIONS);
      AjvErrors(this._ajv);
      AjvKeywords(this._ajv);
    }
    return this._ajv;
  }

  async setup() {

  }

  async getSchemaValidator(schema: string | SchemaObject, name: string): Promise<SchemaValidator> {
    if (typeof schema === 'string') {
      const foundSchema = this.schemaRegistry.get(schema);
      if (!foundSchema) {
        throw new Error(`Schema with name '${schema}' could not be found`)
      }
      return foundSchema;
    }
    const validator = await this.ajv.compileAsync(schema);
    this.schemaRegistry.set(name, [schema, validator]);
    return [schema, validator];
  }

  createPartData(partial: Partial<FormatPartData> | string = PART_DEFAULT_DATA) {
    if (partial && typeof partial === 'string') {
      return { ...PART_DEFAULT_DATA, path: partial };
    }

    if (partial && typeof partial === 'object') {
      return { ...PART_DEFAULT_DATA, ...partial};
    }

    return PART_DEFAULT_DATA;
  }

  createPart(part: FormatPart) {
    const partData = this.createPartData(part.$part);

    Object.defineProperty(part, '$part', { configurable: true, value: partData });

    for (const childName of Object.keys(part)) {
      const childPart = part[childName] as FormatPart;
      const path = [partData.path, partData.type].join('.');
      this.createPart({
        $path: { type: childName, path },
        ...childPart
      });
    }

    return part;
  }

  setPart(part: FormatPart, parent = this.partsRegistry) {
    const newPart = this.createPart(part);
    const pathParts = newPart.$part.path.split('.').filter(pathPart => !!pathPart);

    let current = parent;
    for (let index = 0; index < pathParts.length; index++) {
      const pathPart = pathParts[index];

      if (!current[pathPart] || typeof current[pathPart] !== 'object') {
        current[pathPart] = this.createPart({
          $part: {
            path: [current.$part.path, current.$part.type].join('.'),
            type: pathPart,
            metadata: PART_DEFAULT_DATA.metadata,
            template: PART_DEFAULT_DATA.template
          }
        });
      }

      current = current[pathPart] as FormatPart;
    }

    this.partsRegistry[part.$part.type] = part;
  }

  getPart(paths: [string, ...string[]], parent = this.partsRegistry) {
    const code = paths.map(path => `
      try {
        return part.${path};
      } catch(err) { }
    `).join('') + 'return undefined;';
    const name = `getPart(${paths})`;
    return this.runFunction<FormatPart | undefined>(name, code, ['part'], parent);
  }

  resolvePart(bits: UnresolvedFormatting = this.createPart(), path: string = '') {
    if (typeof bits === 'string') {
      return this.getPart([bits]) || this.createPart({ $part: { path }});
    }

    if (typeof bits === 'object' && !Array.isArray) {
      return this.createPart(bits);
    }

    if (Array.isArray(bits)) {

    }

  }

  functionCache = new Map<string, Function>();
  runFunction<T = any>(name: string, code: string, argNames: string[] = [], ...callArgs: any[]): T {
    const wrappedCode = `
      try {
        ${code}
      } catch (err) {
        console.error('Error in:', ${JSON.stringify(name)}, err);
      }
    `;

    if (!this.functionCache.has(name)) {
      this.functionCache.set(name, new Function(...argNames, wrappedCode));
    }

    return (this.functionCache.get(name) as Function).call(this, ...callArgs) as T;
  }

  async main(context: ConnectorContext<any>, taskConfig: TaskConfig, config: SchemaDoerConfig): Promise<SchemaDoerOutput> {
    const taskName = taskConfig.name;
    const [ schema, validator ] = await this.getSchemaValidator(config.schema, taskName);
    const output: SchemaDoerOutput = {
      schema, validator, taskName,
      data: config.data || {},
      haltOnError: !!config.haltOnError,
      outputPath: config.outputPath || `${taskConfig.name}_uuid`
    };

    const isValid = validator(output.data);
    const errors = validator.errors;

    if (config.format) {

    }

    if (!isValid && config.invalidFormat) {

    }

    if (isValid && config.validFormat) {

    }

    return output;
  }

  async render(schema: SchemaObject, parts: FormatPart) {
    //TODO: Actual rendering
  }
}

export type SchemaValidator = [SchemaObject, ValidateFunction];

export type FormatPartData = {
  metadata: any;
  path: string;
  template: string;
  type: string;
};

export interface FormatParts {
  [name: string]: FormatPart;
}

export type FormatPartWithData = {
  $part: FormatPartData;
}

export type FormatPart = Exclude<FormatParts, keyof '$part'> & FormatPartWithData;

export type UnresolvedFormatting = (
  (string | FormatPart)[] |
  FormatPart | string
);

export type SchemaDoerConfig = {
  schema: string | SchemaObject;
  data?: any;
  outputPath?: string;
  haltOnError?: boolean;
  format?: UnresolvedFormatting;
  validFormat?: UnresolvedFormatting;
  invalidFormat?: UnresolvedFormatting;
};

export type SchemaDoerOutput = {
  taskName: string;
  schema: SchemaObject;
  validator: ValidateFunction;
  data: any;
  outputPath: string;
  haltOnError: boolean;
  format?: FormatPart;
  validFormat?: FormatPart;
  invalidFormat?: FormatPart;
};