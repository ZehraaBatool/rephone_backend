declare module "@sfpy/node-core" {
  namespace Safepay {
    namespace Order {
      class Tracker {
        action(id: string, params?: any, options?: any): Promise<any>;
      }
    }
  }
}
