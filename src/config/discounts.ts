/** Demo discount codes. These are public on purpose: this is a demo storefront. */

export type DiscountRule =
  | { type: "percent"; percent: number }
  | { type: "fixed"; amountCents: number }
  | { type: "free-shipping" };

export interface DiscountConfig {
  code: string;
  description: string;
  rule: DiscountRule;
  minSubtotalCents?: number;
}

export const discounts: DiscountConfig[] = [
  {
    code: "FORGE10",
    description: "10% off your products",
    rule: { type: "percent", percent: 10 },
    minSubtotalCents: 3000,
  },
  {
    code: "WELCOME5",
    description: "5 off orders over 40",
    rule: { type: "fixed", amountCents: 500 },
    minSubtotalCents: 4000,
  },
  {
    code: "FREESHIP",
    description: "Free standard shipping",
    rule: { type: "free-shipping" },
  },
];
