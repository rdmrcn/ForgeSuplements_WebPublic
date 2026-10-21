import {
  PARCEL_OVERHEAD_GRAMS,
  shippingCountries,
  type CountryCode,
  type ShippingMethodConfig,
  type ShippingMethodId,
} from "@/config/shipping";

export interface ShippingQuote {
  methodId: ShippingMethodId;
  label: string;
  description: string;
  costCents: number;
  free: boolean;
  etaBusinessDays: [number, number];
  /** Always true: quotes come from static demo configuration. */
  illustrative: true;
}

export function parcelWeightGrams(itemsWeightGrams: number): number {
  return itemsWeightGrams > 0 ? itemsWeightGrams + PARCEL_OVERHEAD_GRAMS : 0;
}

export function quoteMethod(
  method: ShippingMethodConfig,
  input: { itemsWeightGrams: number; payableSubtotalCents: number; freeShippingCode?: boolean },
): ShippingQuote {
  const weight = parcelWeightGrams(input.itemsWeightGrams);
  const extraKg = Math.max(0, Math.ceil((weight - method.includedGrams) / 1000));
  const rawCost = method.baseCents + extraKg * method.perExtraKgCents;
  const thresholdFree =
    method.freeOverCents !== undefined && input.payableSubtotalCents >= method.freeOverCents;
  const codeFree = Boolean(input.freeShippingCode) && method.id === "standard";
  const free = weight > 0 && (thresholdFree || codeFree);
  return {
    methodId: method.id,
    label: method.label,
    description: method.description,
    costCents: weight === 0 || free ? 0 : rawCost,
    free: weight > 0 && free,
    etaBusinessDays: method.etaBusinessDays,
    illustrative: true,
  };
}

export function getShippingQuotes(
  country: CountryCode,
  input: { itemsWeightGrams: number; payableSubtotalCents: number; freeShippingCode?: boolean },
): ShippingQuote[] {
  return shippingCountries[country].methods.map((m) => quoteMethod(m, input));
}

export function describeEta([min, max]: [number, number]): string {
  return min === max ? `${min} business days` : `${min}-${max} business days`;
}

export function amountUntilFreeShipping(
  country: CountryCode,
  payableSubtotalCents: number,
): number | null {
  const standard = shippingCountries[country].methods.find((m) => m.id === "standard");
  if (!standard?.freeOverCents) return null;
  return Math.max(0, standard.freeOverCents - payableSubtotalCents);
}
