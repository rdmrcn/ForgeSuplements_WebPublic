"use client";

import { ShoppingBag } from "lucide-react";
import { shippingCountries } from "@/config/shipping";
import { describeEta } from "@/domain/shipping";
import { formatMoney } from "@/lib/format";
import { LinkButton } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { useDestinationStore } from "@/store/destination";
import { useCartPricing } from "@/store/hooks";
import { CartLineItem } from "./cart-line-item";
import { DestinationSelect } from "./destination-select";
import { DiscountForm } from "./discount-form";
import { FreeShippingMeter } from "./free-shipping-meter";
import { OrderTotals } from "./order-totals";

export function CartView() {
  const country = useDestinationStore((s) => s.country);
  const methodId = useDestinationStore((s) => s.methodId);
  const setMethod = useDestinationStore((s) => s.setMethod);
  const clear = useCartStore((s) => s.clear);
  const { pricing, hydrated } = useCartPricing(country, methodId);

  if (!hydrated) {
    return (
      <div className="container-x grid gap-10 pb-16 lg:grid-cols-[1.6fr_1fr]" aria-busy="true" aria-label="Loading cart">
        <div className="space-y-4">
          <div className="skeleton h-36" />
          <div className="skeleton h-36" />
        </div>
        <div className="skeleton h-80" />
      </div>
    );
  }

  if (pricing.lines.length === 0) {
    return (
      <div className="container-x flex flex-col items-start gap-5 pb-24" data-testid="cart-empty">
        <ShoppingBag className="size-10 text-stone" aria-hidden />
        <p className="max-w-md text-lg text-ink/70">Your cart is empty. Browse the range and add a pack, or pick up where you left off in your favourites.</p>
        <div className="flex gap-3">
          <LinkButton href="/shop">Shop all products</LinkButton>
          <LinkButton href="/favorites" variant="outline">View favourites</LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x grid gap-12 pb-20 lg:grid-cols-[1.6fr_1fr] xl:gap-20">
      <section aria-label="Cart items">
        {pricing.adjustments.length > 0 && (
          <p role="status" className="mb-4 border border-ember/60 bg-ember/10 p-3 text-sm">{pricing.adjustments.join(" ")}</p>
        )}
        <ul className="divide-y divide-line border-y border-line" data-testid="cart-lines">
          {pricing.lines.map((line) => (
            <CartLineItem key={line.variantId} line={line} />
          ))}
        </ul>
        <button type="button" onClick={clear} className="mt-4 text-sm text-stone underline underline-offset-4 hover:text-danger">Clear cart</button>
      </section>

      <aside aria-label="Order summary" className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
        <div className="space-y-5 border border-line bg-sand/40 p-5 sm:p-6">
          <h2 className="display text-3xl">Summary</h2>
          <FreeShippingMeter pricing={pricing} />
          <DiscountForm pricing={pricing} />
          <div className="space-y-3 border-t border-line pt-4">
            <DestinationSelect id="cart-ship-to" />
            <fieldset>
              <legend className="sr-only">Delivery method estimate</legend>
              <div className="grid gap-2">
                {pricing.quotes.map((q) => (
                  <label key={q.methodId} className="flex cursor-pointer items-center justify-between gap-3 border border-line-strong px-3 py-2.5 text-sm has-[:checked]:border-ink has-[:checked]:bg-white">
                    <span className="flex items-center gap-3">
                      <input type="radio" name="cart-method" checked={methodId === q.methodId} onChange={() => setMethod(q.methodId)} className="accent-[var(--color-ink)]" />
                      <span>
                        {q.label}
                        <span className="block text-xs text-stone">{describeEta(q.etaBusinessDays)}</span>
                      </span>
                    </span>
                    <span className="font-semibold tabular-nums">{q.free ? "Free" : formatMoney(q.costCents)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <p className="text-xs text-stone">Illustrative demo rates for {shippingCountries[country].name}. Not a live carrier quote.</p>
          </div>
          <OrderTotals pricing={pricing} />
          <LinkButton href="/checkout" variant="accent" size="lg" full data-testid="checkout-link">Checkout (demo)</LinkButton>
          <p className="text-center text-xs text-stone">No payment is taken in this demo.</p>
        </div>
      </aside>
    </div>
  );
}
