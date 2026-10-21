"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { useState } from "react";
import { isInStock, minPrice, productFlavors } from "@/domain/catalog";
import { categoryName } from "@/domain/catalog/categories";
import type { Product } from "@/domain/types";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "./add-to-cart";
import { FavoriteButton } from "./favorite-button";
import { PackShot } from "./pack-shot";
import { useVariantSelection } from "./use-variant-selection";
import { VariantSelector } from "./variant-selector";

function QuickAdd({ product, onClose }: { product: Product; onClose: () => void }) {
  const selection = useVariantSelection(product);
  return (
    <div
      role="group"
      aria-label={`Quick add ${product.title}`}
      className="absolute inset-x-0 bottom-0 z-20 space-y-3 border-t text-ink border-line bg-bone p-3 shadow-[0_-12px_30px_-12px_rgb(0_0_0/0.25)] [animation:rise_0.35s_var(--ease-out-expo)_both]"
    >
      <VariantSelector product={product} selection={selection} compact />
      <div className="flex gap-2">
        <AddToCartButton product={product} variant={selection.variant} size="md" showPrice />
        <Button variant="outline" size="md" onClick={onClose} aria-label="Close quick add">
          Close
        </Button>
      </div>
    </div>
  );
}

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const [quick, setQuick] = useState(false);
  const inStock = isInStock(product);
  const flavors = productFlavors(product);
  const prices = product.variants.map((v) => v.priceCents);
  const same = Math.min(...prices) === Math.max(...prices);
  const badge = !inStock ? "Sold out" : product.badges[0];

  return (
    <article className="group/card flex flex-col" data-testid="product-card" data-product-id={product.id} style={{ ["--i" as string]: Math.min(index, 8) }}>
      <div className="relative aspect-[4/5] overflow-hidden bg-sand transition-colors duration-500 group-hover/card:bg-[#dcd4c3]">
        <Link href={`/products/${product.slug}`} className="absolute inset-0 block" aria-label={`${product.title}, view product`} tabIndex={-1}>
          <PackShot
            product={product}
            className="absolute inset-0 size-full origin-bottom scale-[1.08] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover/card:-translate-y-1 group-hover/card:scale-[1.14]"
          />
        </Link>
        {badge && (
          <span className={clsx("eyebrow absolute left-3 top-3 px-2 py-1", !inStock ? "bg-stone text-bone" : "bg-ink text-bone")}>{badge}</span>
        )}
        <FavoriteButton productId={product.id} title={product.title} className="absolute right-3 top-3 z-10" />
        {flavors.length > 1 && (
          <ul aria-label="Available flavours" className="absolute bottom-3 left-3 flex gap-1">
            {product.variants
              .filter((v, i, all) => v.flavor && all.findIndex((x) => x.flavor === v.flavor) === i)
              .slice(0, 5)
              .map((v) => (
                <li key={v.flavor} className="size-3 rounded-full border border-black/25" style={{ background: v.flavorHex }} title={v.flavor} />
              ))}
          </ul>
        )}
        {inStock && !quick && (
          <button
            type="button"
            onClick={() => setQuick(true)}
            aria-label={`Quick add ${product.title}`}
            className="absolute bottom-3 right-3 z-10 h-10 px-4 translate-y-2 bg-ink text-xs font-semibold uppercase tracking-[0.1em] text-bone opacity-100 transition-[opacity,transform,background-color] duration-300 hover:bg-ember hover:text-ink focus-visible:translate-y-0 max-md:translate-y-0 md:opacity-0 md:group-focus-within/card:translate-y-0 md:group-focus-within/card:opacity-100 md:group-hover/card:translate-y-0 md:group-hover/card:opacity-100"
          >
            Quick add
          </button>
        )}
        {quick && <QuickAdd product={product} onClose={() => setQuick(false)} />}
      </div>
      <div className="flex flex-1 flex-col gap-1 pt-4">
        <p className="eyebrow text-stone">{categoryName(product.categoryId)}</p>
        <h3 className="display text-[1.65rem] leading-[0.95]">
          <Link href={`/products/${product.slug}`} className="link-underline">
            {product.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-stone">{product.tagline}</p>
        <p className="mt-auto pt-2 text-[0.9375rem] font-semibold tabular-nums">
          {same ? "" : "From "}
          {formatMoney(minPrice(product))}
        </p>
      </div>
    </article>
  );
}
