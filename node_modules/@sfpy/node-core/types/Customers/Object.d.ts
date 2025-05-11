declare module "@sfpy/node-core" {
  namespace Safepay {
    namespace Customers {
      class Object {
        create(params?: any, options?: any): Promise<any>;

        update(id: string, params?: any, options?: any): Promise<any>;

        find(id: string, options?: any): Promise<any>;

        delete(id: string, options?: any): Promise<any>;

        list(params?: any, options?: any): Promise<any>;
      }
    }
  }
}
