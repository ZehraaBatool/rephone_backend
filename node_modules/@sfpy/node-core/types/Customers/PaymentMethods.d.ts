declare module "@sfpy/node-core" {
  namespace Safepay {
    namespace Customers {
      class PaymentMethods {
        find(
          customer: string,
          paymentMethod: string,
          options?: any
        ): Promise<any>;

        delete(
          customer: string,
          paymentMethod: string,
          options?: any
        ): Promise<any>;

        list(customer: string, params?: any, options?: any): Promise<any>;
      }
    }
  }
}
