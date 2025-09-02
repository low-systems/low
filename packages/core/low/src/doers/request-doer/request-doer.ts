// TODO: Translate `request` options to `AxiosRequestConfig`
// import axios, { AxiosRequestConfig } from 'axios';
import Request = require('request-promise-native');

import { Doer, TaskConfig, ConnectorContext } from '../../index';

export class RequestDoer extends Doer<any, any> {
  async main(context: ConnectorContext<any>, taskConfig: TaskConfig, coreConfig: Request.Options): Promise<any> {
    return await Request(coreConfig);
  }
}