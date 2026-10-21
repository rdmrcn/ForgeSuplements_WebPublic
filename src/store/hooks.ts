"use client";

import { useMemo } from "react";
import type { CountryCode, ShippingMethodId } from "@/config/shipping";
import { priceCart } from "@/domain/pricing";
import { useCartStore } from "./cart";

/** Cart pricing derived from trusted catalog data. Only ids and quantities come from the store. */
export function useCartPricing(country?: CountryCode, shippingMethodId?: ShippingMethodId) {
  const lines = useCartStore((s) => s.lines);
  const discountCode = useCartStore((s) => s.discountCode);
  const hydrated = useCartStore((s) => s.hydrated);
  const pricing = useMemo(
    () => priceCart({ lines, country, shippingMethodId, discountCode }),
    [lines, country, shippingMethodId, discountCode],
  );
  return { pricing, hydrated, discountCode };
}

export function useCartCount(): number {
  const lines = useCartStore((s) => s.lines);
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}
