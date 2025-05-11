declare module "@sfpy/node-core" {
  namespace Safepay {
    namespace Reporter {
      class Payments {
        search(params?: any, options?: any): Promise<any>;
        fetch(id: string, params?: any, options?: any): Promise<any>;
      }
    }
  }
}
