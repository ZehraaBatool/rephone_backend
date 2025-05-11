declare module "@sfpy/node-core" {
  namespace Safepay {
    namespace Invoice {
      class Quicklinks {
        create(params?: any, options?: any): Promise<any>;

        fetch(id: string, params?: any, options?: any): Promise<any>;

        pay(id: string, params?: any, options?: any): Promise<any>;

        success(params?: any, options?: any): Promise<any>;
      }
    }
  }
}
