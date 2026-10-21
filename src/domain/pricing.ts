import { discounts, type DiscountConfig } from "@/config/discounts";
import { DEFAULT_COUNTRY, shippingCountries, type CountryCode, type ShippingMethodId } from "@/config/shipping";
import { formatMoney } from "@/lib/format";
import { resolveLine } from "./catalog";
import { getShippingQuotes, type ShippingQuote } from "./shipping";
import type { CartLine, ResolvedLine } from "./types";

export interface PricingInput {
  lines: CartLine[];
  country?: CountryCode;
  shippingMethodId?: ShippingMethodId;
  discountCode?: string | null;
}

export type DiscountResult =
  | { status: "none" }
  | { status: "applied"; config: DiscountConfig; amountCents: number; freeShipping: boolean }
  | { status: "invalid"; reason: string };

export interface PricingResult {
  lines: ResolvedLine[];
  /** Human-readable adjustments, for example when stock capped a quantity. */
  adjustments: string[];
  itemCount: number;
  subtotalCents: number;
  discount: DiscountResult;
  discountCents: number;
  country: CountryCode;
  quotes: ShippingQuote[];
  shipping: ShippingQuote | null;
  shippingCents: number;
  totalCents: number;
  weightGrams: number;
  currencyNote: string;
}

export function normalizeDiscountCode(code: string | null | undefined): string {
  return (code ?? "").trim().toUpperCase();
}

export function evaluateDiscount(code: string | null | undefined, subtotalCents: number): DiscountResult {
  const normalized = normalizeDiscountCode(code);
  if (!normalized) return { status: "none" };
  const config = discounts.find((d) => d.code === normalized);
  if (!config) return { status: "invalid", reason: "That code is not valid." };
  if (subtotalCents <= 0) return { status: "invalid", reason: "Add something to your cart first." };
  if (config.minSubtotalCents && subtotalCents < config.minSubtotalCents) {
    return {
      status: "invalid",
      reason: `${config.code} needs a subtotal of at least ${formatMoney(config.minSubtotalCents)}.`,
    };
  }
  switch (config.rule.type) {
    case "percent":
      return {
        status: "applied",
        config,
        amountCents: Math.round((subtotalCents * config.rule.percent) / 100),
        freeShipping: false,
      };
    case "fixed":
      return {
        status: "applied",
        config,
        amountCents: Math.min(config.rule.amountCents, subtotalCents),
        freeShipping: false,
      };
    case "free-shipping":
      return { status: "applied", config, amountCents: 0, freeShipping: true };
  }
}

/**
 * The single source of truth for money. It only reads variant ids and
 * quantities from its input; prices, weights, stock caps, discounts and
 * shipping all come from trusted server-side configuration.
 */
export function priceCart(input: PricingInput): PricingResult {
  const country = input.country && input.country in shippingCountries ? input.country : DEFAULT_COUNTRY;
  const adjustments: string[] = [];
  const merged = new Map<string, number>();

  for (const line of input.lines) {
    if (!line || typeof line.variantId !== "string") continue;
    const qty = Number.isFinite(line.quantity) ? Math.floor(line.quantity) : 0;
    if (qty <= 0) continue;
    merged.set(line.variantId, (merged.get(line.variantId) ?? 0) + qty);
  }

  const lines: ResolvedLine[] = [];
  for (const [variantId, requested] of merged) {
    const resolved = resolveLine(variantId, requested);
    if (!resolved) {
      adjustments.push("An item in your cart is no longer available and was removed.");
      continue;
    }
    if (resolved.quantity === 0) {
      adjustments.push(`${resolved.productTitle} (${resolved.variantLabel}) is sold out and was removed.`);
      continue;
    }
    if (resolved.quantity < requested) {
      adjustments.push(
        `${resolved.productTitle} (${resolved.variantLabel}) was limited to ${resolved.quantity} (maximum available).`,
      );
    }
    lines.push(resolved);
  }

  const subtotalCents = lines.reduce((sum, l) => sum + l.lineTotalCents, 0);
  const weightGrams = lines.reduce((sum, l) => sum + l.weightGrams, 0);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);

  const discount = evaluateDiscount(input.discountCode, subtotalCents);
  const discountCents = discount.status === "applied" ? discount.amountCents : 0;
  const freeShippingCode = discount.status === "applied" && discount.freeShipping;
  const payableSubtotalCents = subtotalCents - discountCents;

  const quotes = getShippingQuotes(country, {
    itemsWeightGrams: weightGrams,
    payableSubtotalCents,
    freeShippingCode,
  });
  const shipping =
    quotes.find((q) => q.methodId === input.shippingMethodId) ??
    quotes.find((q) => q.methodId === "standard") ??
    quotes[0] ??
    null;
  const shippingCents = shipping?.costCents ?? 0;

  return {
    lines,
    adjustments,
    itemCount,
    subtotalCents,
    discount,
    discountCents,
    country,
    quotes,
    shipping,
    shippingCents,
    totalCents: Math.max(0, payableSubtotalCents + shippingCents),
    weightGrams,
    currencyNote: "Taxes, customs and import duties are not calculated in this demo.",
  };
}
