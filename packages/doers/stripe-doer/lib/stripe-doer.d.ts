import { Stripe } from 'stripe';
import { Doer, TaskConfig, ConnectorContext, IMap } from 'low';
export declare class StripeDoer extends Doer<IMap<Stripe.StripeConfig>, IMap<StripeKeyPair>> {
    clients: IMap<Stripe>;
    setup(): Promise<void>;
    main(context: ConnectorContext<any>, taskConfig: TaskConfig, config: StripeMethodCall): Promise<any>;
    getContext(stripe: Stripe, path: string, contextPath?: string): any;
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
