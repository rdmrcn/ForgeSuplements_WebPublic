import type { PaymentProvider } from "./provider";

export const demoPaymentProvider: PaymentProvider = {
  id: "demo",
  async createPayment() {
    return { provider: "demo", status: "not_charged_demo", chargedCents: 0 };
  },
};

export function getPaymentProvider(): PaymentProvider {
  const configured = process.env.PAYMENT_PROVIDER ?? "demo";
  if (configured !== "demo") {
    throw new Error(
      `PAYMENT_PROVIDER="${configured}" is not implemented. Only "demo" is available in this repository.`,
    );
  }
  return demoPaymentProvider;
}
