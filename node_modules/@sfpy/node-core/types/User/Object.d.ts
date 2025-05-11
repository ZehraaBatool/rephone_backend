declare module "@sfpy/node-core" {
    namespace Safepay {
        namespace User {
            class Object {
                exists(params?: any, options?: any): Promise<any>;

                update(params?: any, options?: any): Promise<any>;
                
                find(params?: any, options?: any): Promise<any>;
            }
        }
    }
}
