import type { DemoOrder } from "../orders/types";

export interface PaymentIntentResult {
  provider: string;
  /** "not_charged_demo" is the only status the demo provider can return. */
  status: "not_charged_demo";
  chargedCents: 0;
}

/**
 * Server-side payment boundary. A real provider (Stripe, Adyen, iyzico, ...)
 * would create a hosted payment session here and let the provider collect card
 * details. Raw card data must never pass through this application.
 */
export interface PaymentProvider {
  readonly id: string;
  createPayment(order: Pick<DemoOrder, "id" | "pricing" | "customer">): Promise<PaymentIntentResult>;
}
