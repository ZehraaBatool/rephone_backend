declare module "@sfpy/node-core" {
    namespace Safepay {
        namespace User {
            class SignUp {
                register(params?: any, options?: any): Promise<any>;

                resend(params?: any, options?: any): Promise<any>;

                verify(params?: any, options?: any): Promise<any>;
            }
        }
    }
}