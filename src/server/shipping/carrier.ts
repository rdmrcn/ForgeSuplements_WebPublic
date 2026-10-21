import type { CountryCode } from "@/config/shipping";
import { getShippingQuotes, type ShippingQuote } from "@/domain/shipping";

export interface RateRequest {
  country: CountryCode;
  postalCode: string;
  itemsWeightGrams: number;
  payableSubtotalCents: number;
}

/**
 * Extension point for live carrier integrations (DHL, UPS, PTT Kargo, ...).
 * Implement this interface, register the adapter below and call it from the
 * order service. No live carrier is connected in this demo.
 */
export interface CarrierAdapter {
  readonly id: string;
  readonly live: boolean;
  getRates(request: RateRequest): Promise<ShippingQuote[]>;
}

export const configRateCarrier: CarrierAdapter = {
  id: "config-rates",
  live: false,
  async getRates(request) {
    return getShippingQuotes(request.country, {
      itemsWeightGrams: request.itemsWeightGrams,
      payableSubtotalCents: request.payableSubtotalCents,
    });
  },
};

const adapters: CarrierAdapter[] = [configRateCarrier];

export function getCarrierAdapter(id = "config-rates"): CarrierAdapter {
  return adapters.find((a) => a.id === id) ?? configRateCarrier;
}
