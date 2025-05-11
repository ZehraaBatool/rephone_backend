declare module "@sfpy/node-core" {
  namespace Safepay {
    class Checkout {
      createCheckoutUrl: ({
        // The target environment you are tying to hit
        env,
        // The passport token to authenticate client side requests with
        tbt,
        // The tracker token
        tracker,
        // The targeted source from where the transaction is originating from
        source,
        user_id,
        address,
        order_id,
        is_implicit,
        cancel_url,
        redirect_url,
      }: {
        env: "development" | "sandbox" | "production";
        tbt: string;
        tracker: string;
        source: "hosted" | "mobile" | "popup" | "woocommerce" | "shopify";
        user_id?: string;
        address?: string;
        order_id?: string;
        is_implicit?: boolean;
        cancel_url?: string;
        redirect_url?: string;
      }) => string;
    }
  }
}
