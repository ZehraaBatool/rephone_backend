declare module "@sfpy/node-core" {
  namespace Safepay {
    namespace Order {
      class Configure {
        reset(id: string, params?: any, options?: any): Promise<any>;

        metadata(id: string, params?: any, options?: any): Promise<any>;
      }
    }
  }
}
