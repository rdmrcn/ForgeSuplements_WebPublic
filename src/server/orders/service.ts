import { randomBytes } from "node:crypto";
import { brand } from "@/config/brand";
import { normalizeAddress, orderRequestSchema, type OrderRequest } from "@/domain/checkout";
import { priceCart } from "@/domain/pricing";
import { getPaymentProvider } from "../payments/demo-provider";
import { getOrderRepository } from "./repository";
import type { DemoOrder } from "./types";

export type CreateOrderResult =
  | { ok: true; order: DemoOrder }
  | {
      ok: false;
      status: 400 | 409 | 500;
      code: "invalid_request" | "price_mismatch" | "cart_changed" | "empty_cart" | "server_error";
      message: string;
      fieldErrors?: Record<string, string>;
      /** Server-authoritative total, returned so the UI can refresh itself. */
      serverTotalCents?: number;
    };

const ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateOrderId(): string {
  const bytes = randomBytes(10);
  let suffix = "";
  for (const b of bytes) suffix += ID_ALPHABET[b % ID_ALPHABET.length];
  return `FRG-DEMO-${suffix}`;
}

export async function createDemoOrder(payload: unknown): Promise<CreateOrderResult> {
  const parsed = orderRequestSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      status: 400,
      code: "invalid_request",
      message: "Some of the details need attention.",
      fieldErrors,
    };
  }

  const request: OrderRequest = parsed.data;
  const { checkout } = request;

  const priced = priceCart({
    lines: request.items,
    country: checkout.shipping.country,
    shippingMethodId: checkout.shippingMethodId,
    discountCode: checkout.discountCode,
  });

  if (priced.lines.length === 0) {
    return { ok: false, status: 400, code: "empty_cart", message: "Your cart has no available items." };
  }
  if (priced.adjustments.length > 0) {
    return {
      ok: false,
      status: 409,
      code: "cart_changed",
      message: `Your cart changed: ${priced.adjustments.join(" ")}`,
      serverTotalCents: priced.totalCents,
    };
  }
  if (priced.discount.status === "invalid") {
    return { ok: false, status: 409, code: "cart_changed", message: priced.discount.reason, serverTotalCents: priced.totalCents };
  }
  if (!priced.shipping || priced.shipping.methodId !== checkout.shippingMethodId) {
    return { ok: false, status: 400, code: "invalid_request", message: "That delivery method is not available." };
  }
  if (priced.totalCents !== request.expectedTotalCents) {
    return {
      ok: false,
      status: 409,
      code: "price_mismatch",
      message: "The order total no longer matches the current prices. Please review your order.",
      serverTotalCents: priced.totalCents,
    };
  }

  const shippingAddress = normalizeAddress(checkout.shipping);
  const billingAddress = normalizeAddress(checkout.billingSame || !checkout.billing ? checkout.shipping : checkout.billing);

  const order: DemoOrder = {
    id: generateOrderId(),
    createdAt: new Date().toISOString(),
    mode: "demo",
    status: "demo_created",
    paymentStatus: "not_charged_demo",
    fulfilmentStatus: "not_fulfilled",
    paymentProvider: "demo",
    customer: { email: checkout.email, phone: checkout.phone },
    shippingAddress,
    billingAddress,
    shipping: {
      methodId: priced.shipping.methodId,
      label: priced.shipping.label,
      costCents: priced.shippingCents,
      etaBusinessDays: priced.shipping.etaBusinessDays,
      country: priced.country,
      illustrative: true,
    },
    lines: priced.lines,
    pricing: {
      currency: brand.currency.code,
      subtotalCents: priced.subtotalCents,
      discountCode: priced.discount.status === "applied" ? priced.discount.config.code : null,
      discountCents: priced.discountCents,
      shippingCents: priced.shippingCents,
      totalCents: priced.totalCents,
    },
  };

  try {
    const payment = await getPaymentProvider().createPayment(order);
    order.paymentProvider = payment.provider;
    await getOrderRepository().create(order);
  } catch (error) {
    console.error("[orders] Failed to create demo order", error);
    return { ok: false, status: 500, code: "server_error", message: "We could not create the demo order. Please try again." };
  }

  return { ok: true, order };
}
