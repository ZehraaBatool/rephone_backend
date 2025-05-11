declare module "@sfpy/node-core" {
  namespace Safepay {
    namespace Order {
      class Vault {
        session(params?: any, options?: any): Promise<any>;

        card(params?: any, options?: any): Promise<any>;
      }
    }
  }
}
