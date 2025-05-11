declare module "@sfpy/node-core" {
  namespace Safepay {
    namespace Guests {
      class Object {
        create(params?: any, options?: any): Promise<any>;

        createV2(params?: any, options?: any): Promise<any>;
      }
    }
  }
}
