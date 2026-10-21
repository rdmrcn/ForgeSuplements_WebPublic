import { shippingCountries } from "@/config/shipping";
import type { PricingResult } from "@/domain/pricing";
import { describeEta } from "@/domain/shipping";
import { formatMoney } from "@/lib/format";

export function OrderTotals({ pricing, estimate = true }: { pricing: PricingResult; estimate?: boolean }) {
  const country = shippingCountries[pricing.country];
  const row = "flex items-baseline justify-between gap-4";
  return (
    <dl className="space-y-2.5 text-sm" data-testid="order-totals">
      <div className={row}>
        <dt>Subtotal</dt>
        <dd className="tabular-nums" data-testid="subtotal">{formatMoney(pricing.subtotalCents)}</dd>
      </div>
      {pricing.discountCents > 0 && (
        <div className={`${row} text-ok`}>
          <dt>Discount</dt>
          <dd className="tabular-nums" data-testid="discount">-{formatMoney(pricing.discountCents)}</dd>
        </div>
      )}
      <div className={row}>
        <dt>
          {estimate ? "Estimated shipping" : "Shipping"}
          {pricing.shipping && pricing.itemCount > 0 && (
            <span className="block text-xs text-stone">
              {pricing.shipping.label} to {country.name}, {describeEta(pricing.shipping.etaBusinessDays)} (illustrative)
            </span>
          )}
        </dt>
        <dd className="tabular-nums" data-testid="shipping">
          {pricing.itemCount === 0 ? "-" : pricing.shipping?.free ? "Free" : formatMoney(pricing.shippingCents)}
        </dd>
      </div>
      <div className={`${row} border-t border-line-strong pt-3 text-base font-semibold`}>
        <dt>{estimate ? "Estimated total" : "Total"}</dt>
        <dd className="text-lg tabular-nums" data-testid="total">{formatMoney(pricing.totalCents)}</dd>
      </div>
      <p className="text-xs leading-snug text-stone">{pricing.currencyNote}</p>
    </dl>
  );
}
