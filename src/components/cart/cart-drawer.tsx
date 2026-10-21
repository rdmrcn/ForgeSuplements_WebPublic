"use client";

import { ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Drawer } from "@/components/ui/drawer";
import { LinkButton } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { useDestinationStore } from "@/store/destination";
import { useCartPricing } from "@/store/hooks";
import { CartLineItem } from "./cart-line-item";
import { DestinationSelect } from "./destination-select";
import { DiscountForm } from "./discount-form";
import { FreeShippingMeter } from "./free-shipping-meter";
import { OrderTotals } from "./order-totals";

export function CartDrawer() {
  const open = useCartStore((s) => s.drawerOpen);
  const close = useCartStore((s) => s.closeDrawer);
  const country = useDestinationStore((s) => s.country);
  const methodId = useDestinationStore((s) => s.methodId);
  const { pricing, hydrated } = useCartPricing(country, methodId);
  const pathname = usePathname();

  useEffect(() => {
    close();
  }, [pathname, close]);

  const empty = pricing.lines.length === 0;

  return (
    <Drawer open={open} onClose={close} side="right" label="Shopping cart" className="flex w-[min(30rem,100vw)] flex-col bg-bone shadow-2xl">
      <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-line px-5">
        <h2 className="display text-2xl">
          Your cart <span className="text-stone" data-testid="drawer-count">({pricing.itemCount})</span>
        </h2>
        <button type="button" onClick={close} aria-label="Close cart" className="inline-flex size-11 items-center justify-center hover:bg-ink/6">
          <X className="size-6" aria-hidden />
        </button>
      </div>

      {!hydrated ? (
        <div className="flex-1 space-y-4 p-5" aria-busy="true">
          <div className="skeleton h-28" />
          <div className="skeleton h-28" />
        </div>
      ) : empty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center" data-testid="cart-empty">
          <ShoppingBag className="size-10 text-stone" aria-hidden />
          <div>
            <p className="display text-3xl">Nothing here yet</p>
            <p className="mt-2 text-stone">Your cart is empty. Start with the best sellers.</p>
          </div>
          <LinkButton href="/shop" onClick={close}>
            Shop all products
          </LinkButton>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-5">
            {pricing.adjustments.length > 0 && (
              <p role="status" className="mt-4 border border-ember/60 bg-ember/10 p-3 text-sm">
                {pricing.adjustments.join(" ")}
              </p>
            )}
            <ul className="divide-y divide-line">
              {pricing.lines.map((line) => (
                <CartLineItem key={line.variantId} line={line} compact onNavigate={close} />
              ))}
            </ul>
          </div>
          <div className="shrink-0 space-y-4 border-t border-line bg-sand/40 p-5">
            <FreeShippingMeter pricing={pricing} />
            <DiscountForm pricing={pricing} />
            <DestinationSelect id="drawer-ship-to" />
            <OrderTotals pricing={pricing} />
            <div className="grid gap-2">
              <LinkButton href="/checkout" variant="accent" size="lg" full data-testid="drawer-checkout">
                Checkout (demo)
              </LinkButton>
              <Link href="/cart" onClick={close} className="py-2 text-center text-sm font-medium underline underline-offset-4">
                View full cart
              </Link>
            </div>
          </div>
        </>
      )}
    </Drawer>
  );
}
