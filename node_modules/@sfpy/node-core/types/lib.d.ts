///<reference lib="esnext.asynciterable" />
/// <reference types="node" />

declare module "@sfpy/node-core" {
  namespace Safepay {
    type SafepayResourceClass = typeof SafepayResource;

    interface SafepayResourceExtension<T extends object>
      extends SafepayResourceClass {
      new (safepay: Safepay): SafepayResource & T;
    }

    export class SafepayResource {
      static extend<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        T extends { [prop: string]: any },
      >(spec: T): SafepayResourceExtension<T>;
      static method(spec: {
        method: string;
        path?: string;
        fullPath?: string;
      }): (...args: any[]) => any; //eslint-disable-line @typescript-eslint/no-explicit-any
    }

    export interface SafepayConfig {
      /**
       * Request timeout in milliseconds.
       * The default is 80000
       */
      timeout?: number;

      /**
       * Specify the host to use for API Requests.
       */
      host?: string;

      /**
       * Specify the authType to authenticate e.g either secret or jwt
       */
      authType?: "jwt" | "secret";

      /**
       * Use a custom http client, rather than relying on Node libraries.
       * Useful for making requests in contexts other than NodeJS (eg. using
       * `axios`).
       */
      httpClient?: HttpClient;
    }
  }
}
