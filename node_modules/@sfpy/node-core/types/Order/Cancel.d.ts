declare module "@sfpy/node-core" {
  namespace Safepay {
    namespace Order {
      class Cancel {
        reverse(id: string, params?: any, options?: any): Promise<any>;

        refund(id: string, params?: any, options?: any): Promise<any>;

        void(id: string, params?: any, options?: any): Promise<any>;
      }
    }
  }
}
