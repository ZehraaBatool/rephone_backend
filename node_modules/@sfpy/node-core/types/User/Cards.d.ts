declare module "@sfpy/node-core" {
    namespace Safepay {
        namespace User {
            class Cards {
                delete(params?: any, options?: any): Promise<any>;

                find(instrument: string, params?: any, options?: any): Promise<any>;

                list(params?: any, options?: any): Promise<any>;
            }
        }
    }
}