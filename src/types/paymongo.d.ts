declare module 'paymongo' {
  interface PayMongoOptions {
    timeout?: number;
  }

  interface ResponseData {
    id: string;
    type: string;
    attributes: any;
    links?: any;
  }

  interface Response {
    data: ResponseData;
    included?: any[];
  }

  interface PaymentIntents {
    create(options: { data: { attributes: any } }): Promise<Response>;
    attach(paymentIntentId: string, options: { data: { attributes: any } }): Promise<Response>;
    retrieve(id: string): Promise<Response>;
    list(params?: any): Promise<Response>;
  }

  interface PaymentMethods {
    create(options: { data: { attributes: any } }): Promise<Response>;
    retrieve(id: string): Promise<Response>;
    list(params?: any): Promise<Response>;
  }

  interface Webhooks {
    create(options: { data: { attributes: any } }): Promise<Response>;
    retrieve(id: string): Promise<Response>;
    list(params?: any): Promise<Response>;
    update(id: string, options: { data: { attributes: any } }): Promise<Response>;
    enableEvent(id: string, eventId: string): Promise<Response>;
    disableEvent(id: string, eventId: string): Promise<Response>;
  }

  interface Sources {
    create(options: { data: { attributes: any } }): Promise<Response>;
    retrieve(id: string): Promise<Response>;
    list(params?: any): Promise<Response>;
  }

  interface Payments {
    create(options: { data: { attributes: any } }): Promise<Response>;
    retrieve(id: string): Promise<Response>;
    list(params?: any): Promise<Response>;
  }

  interface Customers {
    create(options: { data: { attributes: any } }): Promise<Response>;
    retrieve(id: string): Promise<Response>;
    list(params?: any): Promise<Response>;
    update(id: string, options: { data: { attributes: any } }): Promise<Response>;
  }

  class Paymongo {
    paymentIntents: PaymentIntents;
    paymentMethods: PaymentMethods;
    webhooks: Webhooks;
    sources: Sources;
    payments: Payments;
    customers: Customers;

    constructor(secretKey: string, options?: PayMongoOptions);
  }

  export = Paymongo;
}
