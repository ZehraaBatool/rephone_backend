declare module "@sfpy/node-core" {
  namespace Safepay {
    namespace Order {
      class Discount {
        list(params?: any, options?: any): Promise<any>;

        apply(id: string, params?: any, options?: any): Promise<any>;
      }
    }
  }
}
