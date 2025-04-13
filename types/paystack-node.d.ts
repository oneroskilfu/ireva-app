declare module 'paystack-node' {
  interface PaystackOptions {
    apiKey: string;
  }

  interface PaystackResponse {
    status: boolean;
    message: string;
    data: any;
    body: any;
  }

  interface TransactionInitializeData {
    amount: number;
    email: string;
    reference?: string;
    callback_url?: string;
    metadata?: any;
    [key: string]: any;
  }

  interface TransactionVerifyParams {
    reference: string;
  }

  class Paystack {
    constructor(secretKey: string, options?: PaystackOptions);

    transaction: {
      initialize(data: TransactionInitializeData): Promise<PaystackResponse>;
      verify(reference: string): Promise<PaystackResponse>;
      list(): Promise<PaystackResponse>;
      fetch(id: string): Promise<PaystackResponse>;
      charge(data: any): Promise<PaystackResponse>;
    };

    customer: {
      create(data: any): Promise<PaystackResponse>;
      list(): Promise<PaystackResponse>;
      fetch(email_or_code: string): Promise<PaystackResponse>;
      update(code: string, data: any): Promise<PaystackResponse>;
    };

    plan: {
      create(data: any): Promise<PaystackResponse>;
      list(): Promise<PaystackResponse>;
      fetch(id_or_code: string): Promise<PaystackResponse>;
      update(id_or_code: string, data: any): Promise<PaystackResponse>;
    };

    subscription: {
      create(data: any): Promise<PaystackResponse>;
      list(): Promise<PaystackResponse>;
      fetch(id_or_code: string): Promise<PaystackResponse>;
      enable(code: string, token: string): Promise<PaystackResponse>;
      disable(code: string, token: string): Promise<PaystackResponse>;
    };
  }

  export = Paystack;
}