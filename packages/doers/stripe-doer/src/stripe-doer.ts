import { Stripe } from 'stripe';
import * as Dot from 'dot-object';

import { Doer, TaskConfig, ConnectorContext, IMap } from 'low';

export class StripeDoer extends Doer<IMap<Stripe.StripeConfig>, IMap<StripeKeyPair>> {
  clients: IMap<Stripe> = {};

  async setup() {
    for (const [name, keyPair] of Object.entries(this.secrets)) {
      this.clients[name] = new Stripe(keyPair.secret_key, this.config[name] || {});
    }
  }

  async main(context: ConnectorContext<any>, taskConfig: TaskConfig, config: StripeMethodCall): Promise<any> {
    if (!(config.client in this.clients)) {
      throw new Error(`No stripe client called '${config.client}'`);
    }

    const stripe = this.clients[config.client];
    const method = Dot.pick(config.path, stripe);

    if (typeof method !== 'function') {
      if (!config.justReturn) {
        throw new Error(`Stripe.${config.path} is not a function`);
      } else {
        return method;
      }
    }

    const args = config.args || [];
    const isAsync = typeof config.isAsync === 'boolean' ? config.isAsync : method.constructor.name === 'AsyncFunction';

    context = this.getContext(stripe, config.path, config.context);

    if (isAsync) {
      return await method.apply(context, args);
    } else {
      return method.apply(context, args);
    }
  }

  getContext(stripe: Stripe, path: string, contextPath?: string) {
    if (!contextPath) {
      if (path.indexOf('.') === -1) {
        return stripe;
      }
      contextPath = path.substring(0, path.lastIndexOf('.'));
    }

    const context = Dot.pick(contextPath, stripe);
    if (!context) {
      throw new Error(`Could not find context for Stripe call at path '${contextPath}'`);
    }

    return context;
  }
}

export interface StripeKeyPair {
  publishable_key: string;
  secret_key: string;
}

export interface StripeMethodCall {
  client: string;
  path: string;
  args?: any[];
  isAsync?: boolean;
  justReturn?: boolean;
  context?: string;
}