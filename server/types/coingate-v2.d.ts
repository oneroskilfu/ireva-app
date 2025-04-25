declare module 'coingate-v2' {
  interface Config {
    LIVE: string;
    SANDBOX: string;
  }

  interface ClientOptions {
    token: string;
    mode?: string;
  }

  interface PaymentParams {
    order_id: string;
    price_amount: number;
    price_currency: string;
    receive_currency?: string;
    title?: string;
    description?: string;
    callback_url?: string;
    cancel_url?: string;
    success_url?: string;
    token?: string;
  }

  interface PaymentResponse {
    id: string;
    status: string;
    price_amount: number;
    price_currency: string;
    receive_amount: number;
    receive_currency: string;
    payment_url: string;
    token: string;
    created_at: string;
    order_id: string;
    payment_address?: string;
    expires_at?: string;
  }

  class Client {
    constructor(config: any);
    static create(options: ClientOptions): Client;
    createOrder(params: PaymentParams): Promise<PaymentResponse>;
    getOrder(id: string): Promise<PaymentResponse>;
    listOrders(params?: any): Promise<PaymentResponse[]>;
    cancelOrder(id: string): Promise<any>;
    ping(): Promise<{ ping: string }>;
  }

  interface CoinGateModule {
    Config: Config;
    Client: typeof Client;
    testClient(token: string): Client;
    client(token: string): Client;
  }

  const module: CoinGateModule;
  export default module;
}