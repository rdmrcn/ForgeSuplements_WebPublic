"use client";

import Link from "next/link";
import { dailyDeal } from "@/config/deals";
import { getVariant } from "@/domain/catalog";
import { formatMoney } from "@/lib/format";
import { AddToCartButton } from "@/components/product/add-to-cart";
import { PackShot } from "@/components/product/pack-shot";
import { LinkButton } from "@/components/ui/button";

export function DailyDeal({ className = "" }: { className?: string }) {
  const found = getVariant(dailyDeal.variantId);
  if (!found) return null;
  const { product, variant } = found;
  const save = variant.compareAtCents
    ? Math.round(((variant.compareAtCents - variant.priceCents) / variant.compareAtCents) * 100)
    : 0;

  return (
    <section id="daily-deal" className={className} aria-labelledby="deal-heading" data-testid="daily-deal">
      <div className="container-x">
        <div className="relative isolate grid items-center gap-8 overflow-hidden bg-charcoal text-bone sm:grid-cols-[1.15fr_1fr] sm:gap-4">
          <div aria-hidden className="absolute -right-24 top-1/2 -z-10 size-[28rem] -translate-y-1/2 rounded-full bg-[#4b5bd1]/35 blur-3xl" />
          <div className="p-6 sm:p-10 lg:p-14">
            <p className="eyebrow inline-flex items-center gap-2 bg-ember px-2 py-1 text-ink">
              {dailyDeal.eyebrow}
              {save > 0 && <span>-{save}%</span>}
            </p>
            <h2 id="deal-heading" className="display mt-5 text-[clamp(2.5rem,6vw,5rem)]">
              {dailyDeal.headline}
            </h2>
            <p className="mt-3 max-w-md text-bone/75">
              {product.title}, {variant.size} tub. {variant.servings} servings of 5 g creatine monohydrate, now with a light blueberry flavour.
            </p>
            <p className="mt-6 flex items-baseline gap-3" data-testid="deal-price">
              <span className="display text-5xl text-ember">{formatMoney(variant.priceCents)}</span>
              {variant.compareAtCents && (
                <span className="text-lg text-bone/55">
                  <span className="sr-only">Was </span>
                  <s>{formatMoney(variant.compareAtCents)}</s>
                </span>
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="w-full sm:w-64">
                <AddToCartButton product={product} variant={variant} />
              </div>
              <LinkButton href={`/products/${product.slug}`} variant="outline-inverse" size="lg">
                View product
              </LinkButton>
            </div>
            <p className="mt-4 text-xs text-bone/50">
              Demo pricing. <Link href="/policies/shipping" className="underline underline-offset-2">Shipping policy</Link>
            </p>
          </div>
          <Link href={`/products/${product.slug}`} className="relative mx-auto block w-[min(20rem,70%)] sm:w-full sm:max-w-sm sm:self-end" aria-label={`${product.title}, view product`} tabIndex={-1}>
            <PackShot product={product} variant={variant} bare className="w-full translate-y-[6%] drop-shadow-2xl" />
          </Link>
        </div>
      </div>
    </section>
  );
}
