///<reference path='./lib.d.ts' />
///<reference path='./net/net.d.ts' />
///<reference path='./Errors.d.ts' />
///<reference path='./Checkout.d.ts' />
///<reference path='./Guests/Object.d.ts' />
///<reference path='./Customers/Object.d.ts' />
///<reference path='./Customers/Addresses.d.ts' />
///<reference path='./Customers/PaymentMethods.d.ts' />
///<reference path='./Order/Cancel.d.ts' />
///<reference path='./Order/Configure.d.ts' />
///<reference path='./Order/Tracker.d.ts' />
///<reference path='./Order/Discount.d.ts' />
///<reference path='./Order/Vault.d.ts' />
///<reference path='./Payments/Session.d.ts' />
///<reference path='./User/SignUp.d.ts' />
///<reference path='./User/Password.d.ts' />
///<reference path='./User/Object.d.ts' />
///<reference path='./User/Cards.d.ts' />
///<reference path='./Auth/Login.d.ts' />
///<reference path='./Auth/Logout.d.ts' />
///<reference path='./Invoice/Quicklinks.d.ts' />
///<reference path='./Reporter/Payments.d.ts' />
///<reference path='./Client/Passport.d.ts' />

declare module "@sfpy/node-core" {
  // Added to in other modules, referenced above.
  export namespace Safepay {}
  export function createSafepay(): Safepay;

  export class Safepay {
    static Safepay: typeof Safepay;
    constructor(apiKey: string, config: Safepay.SafepayConfig);

    /**
     * API Errors
     */
    errors: typeof Safepay.errors;

    checkout: Safepay.Checkout;

    customers: {
      object: Safepay.Customers.Object;
      addresses: Safepay.Customers.Addresses;
      paymentMethods: Safepay.Customers.PaymentMethods;
    };

    order: {
      tracker: Safepay.Order.Tracker;
      configure: Safepay.Order.Configure;
      cancel: Safepay.Order.Cancel;
      discount: Safepay.Order.Discount;
      vault: Safepay.Order.Vault;
    };

    payments: {
      session: Safepay.Payments.Session;
    };

    guests: {
      object: Safepay.Guests.Object;
    };

    user: {
      signUp: Safepay.User.SignUp;
      password: Safepay.User.Password;
      object: Safepay.User.Object;
      cards: Safepay.User.Cards;
    };

    auth: {
      login: Safepay.Auth.Login;
      logout: Safepay.Auth.Logout;
    };

    invoice: {
      quicklinks: Safepay.Invoice.Quicklinks;
    };

    reporter: {
      payments: Safepay.Reporter.Payments;
    };

    client: {
      passport: Safepay.Client.Passport;
    };
  }
  export default Safepay;
}
