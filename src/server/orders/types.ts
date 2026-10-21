import type { CountryCode, ShippingMethodId } from "@/config/shipping";
import type { AddressInput } from "@/domain/checkout";
import type { ResolvedLine } from "@/domain/types";

export interface DemoOrder {
  id: string;
  createdAt: string;
  /** A demo order is never a real, accepted, paid or shipped order. */
  mode: "demo";
  status: "demo_created";
  paymentStatus: "not_charged_demo";
  fulfilmentStatus: "not_fulfilled";
  paymentProvider: string;
  customer: { email: string; phone: string };
  shippingAddress: AddressInput;
  billingAddress: AddressInput;
  shipping: {
    methodId: ShippingMethodId;
    label: string;
    costCents: number;
    etaBusinessDays: [number, number];
    country: CountryCode;
    illustrative: true;
  };
  lines: ResolvedLine[];
  pricing: {
    currency: string;
    subtotalCents: number;
    discountCode: string | null;
    discountCents: number;
    shippingCents: number;
    totalCents: number;
  };
}

export interface OrderRepository {
  create(order: DemoOrder): Promise<void>;
  get(id: string): Promise<DemoOrder | null>;
}
