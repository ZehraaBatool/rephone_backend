declare module "@sfpy/node-core" {
    namespace Safepay {
        type SafepayRawError = {
            message?: string;
            status?: number;
        };
        namespace errors {
            class SafepayError extends Error {
                constructor(raw: SafepayRawError, type: string | null);
                readonly message: string;
                readonly type: string;
                readonly headers?: { [header: string]: string };
                readonly status?: number;
            };
            class SafepayInvalidRequestError extends SafepayError {
                constructor(raw: SafepayRawError);
                readonly type: 'SafepayInvalidRequestError';
            };
            class SafepayAPIError extends SafepayError {
                constructor(raw: SafepayRawError);
                readonly type: 'SafepayAPIError';
            };
            class SafepayAuthenticationError extends SafepayError {
                constructor(raw: SafepayRawError);
                readonly type: 'SafepayAuthenticationError';
            };
            class SafepayConflictError extends SafepayError {
                constructor(raw: SafepayRawError);
                readonly type: 'SafepayConflictError';
            };
            class SafepayUnknownError extends SafepayError {
                constructor(raw: SafepayRawError);
                readonly type: 'SafepayUnknownError';
            };
        }
    }
}
