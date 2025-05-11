declare module "@sfpy/node-core" {
    namespace Safepay {
        namespace User {
            class Password {
                reset(params?: any, options?: any): Promise<any>;

                forgot(params?: any, options?: any): Promise<any>;
            }
        }
    }
}
