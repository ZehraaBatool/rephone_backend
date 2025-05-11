/// <reference types="node" />

declare module "@sfpy/node-core" {
  namespace Safepay {
    /**
     * Encapsulates the logic for issuing a request to the Safepay API. This is
     * an experimental interface and is not yet stable.
     */
    export interface HttpClient<
      ResponseType extends HttpClientResponse = HttpClientResponse,
    > {
      /** The client name to use for diagnostics. */
      getClientName(): string;

      makeRequest(
        host: string,
        path: string,
        method: "GET" | "POST" | "PUT" | "DELETE",
        // object is used here as this is implementation-specific. This is
        // generally {[key: string]: string}, but various underlying clients
        // support other types as well. As examples:
        // - Node supports {[key: string]: string | number | string[]}.
        // - Fetch supports a Headers object.
        headers: object,
        requestData: string | null,
        timeout: number
      ): Promise<ResponseType>;
    }

    /**
     * Abstract representation of an HTTP response. This is an experimental
     * interface and is not yet stable.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interface HttpClientResponse<RawResponseType = any, StreamType = any> {
      /** The numeric HTTP status code for the response. */
      getStatusCode(): number;

      /** The response headers. */
      getHeaders(): { [key: string]: string };

      /**
       * Converts the response content into a JSON object, failing if JSON
       * couldn't be parsed.
       */
      toJSON(): Promise<object>;
    }
  }
}
