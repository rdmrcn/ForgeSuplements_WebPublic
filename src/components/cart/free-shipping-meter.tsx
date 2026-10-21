import { shippingCountries } from "@/config/shipping";
import type { PricingResult } from "@/domain/pricing";
import { amountUntilFreeShipping } from "@/domain/shipping";
import { formatMoney } from "@/lib/format";

export function FreeShippingMeter({ pricing }: { pricing: PricingResult }) {
  const payable = pricing.subtotalCents - pricing.discountCents;
  const remaining = amountUntilFreeShipping(pricing.country, payable);
  const standard = shippingCountries[pricing.country].methods.find((m) => m.id === "standard");
  if (remaining === null || !standard?.freeOverCents || pricing.itemCount === 0) return null;
  const pct = Math.min(100, Math.round((payable / standard.freeOverCents) * 100));
  return (
    <div>
      <p className="text-sm" data-testid="free-shipping-note">
        {remaining === 0 ? (
          <>Standard delivery to {shippingCountries[pricing.country].name} is free (illustrative threshold).</>
        ) : (
          <>
            Add <strong>{formatMoney(remaining)}</strong> for free standard delivery to {shippingCountries[pricing.country].name} (illustrative).
          </>
        )}
      </p>
      <div className="mt-2 h-1 bg-ink/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to free shipping">
        <div className="h-full bg-ember transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
