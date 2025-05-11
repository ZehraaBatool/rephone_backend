declare module "@sfpy/node-core" {
  namespace Safepay {
    namespace Customers {
      class Addresses {
        create(params?: any, options?: any): Promise<any>;

        update(id: string, params?: any, options?: any): Promise<any>;

        find(id: string, options?: any): Promise<any>;
      }
    }
  }
}
