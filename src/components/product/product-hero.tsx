"use client";

import { Truck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MAX_LINE_QUANTITY } from "@/domain/catalog";
import { categoryName, getCategory } from "@/domain/catalog/categories";
import type { Product } from "@/domain/types";
import { formatMoney } from "@/lib/format";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { useRecentStore } from "@/store/lists";
import { AddToCartButton } from "./add-to-cart";
import { FavoriteButton } from "./favorite-button";
import { ProductGallery } from "./product-gallery";
import { useVariantSelection } from "./use-variant-selection";
import { VariantSelector } from "./variant-selector";

export function ProductHero({ product }: { product: Product }) {
  const selection = useVariantSelection(product);
  const { variant } = selection;
  const [quantity, setQuantity] = useState(1);
  const record = useRecentStore((s) => s.record);
  const max = Math.max(1, Math.min(variant.stock, MAX_LINE_QUANTITY));
  const qty = Math.min(quantity, max);
  const category = getCategory(product.categoryId);

  useEffect(() => {
    record(product.id);
  }, [product.id, record]);

  const stock =
    variant.stock <= 0
      ? { text: "Sold out", tone: "bg-stone" }
      : variant.stock <= 5
        ? { text: `Only ${variant.stock} left`, tone: "bg-ember" }
        : { text: "In stock", tone: "bg-ok" };

  return (
    <div className="container-x grid gap-8 pb-16 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
      <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
        <ProductGallery product={product} variant={variant} />
      </div>

      <div className="max-w-xl">
        <Link href={`/shop/${category?.slug ?? ""}`} className="eyebrow text-stone hover:text-ink">{categoryName(product.categoryId)}</Link>
        <h1 className="display mt-2 text-[clamp(2.75rem,6vw,5rem)]" data-testid="product-title">{product.title}</h1>
        <p className="mt-3 text-lg text-ink/70">{product.tagline}</p>

        <div className="mt-6 flex flex-wrap items-baseline gap-3">
          <p className="text-3xl font-semibold tabular-nums" data-testid="product-price">{formatMoney(variant.priceCents)}</p>
          {variant.compareAtCents && (
            <p className="text-lg text-stone line-through tabular-nums" aria-label={`Was ${formatMoney(variant.compareAtCents)}`}>{formatMoney(variant.compareAtCents)}</p>
          )}
          {variant.servings && (
            <p className="text-sm text-stone">about {formatMoney(Math.round(variant.priceCents / variant.servings))} per serving ({variant.servings} servings)</p>
          )}
        </div>
        <p className="mt-2 flex items-center gap-2 text-sm" role="status" data-testid="stock-status">
          <span aria-hidden className={`size-2 rounded-full ${stock.tone}`} /> {stock.text}
          <span className="text-stone">&middot; SKU {variant.sku}</span>
        </p>

        <div className="mt-8">
          <VariantSelector product={product} selection={selection} />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <QuantityStepper value={qty} max={max} onChange={setQuantity} label={product.title} />
          <div className="min-w-[12rem] flex-1">
            <AddToCartButton product={product} variant={variant} quantity={qty} showPrice />
          </div>
          <FavoriteButton productId={product.id} title={product.title} withLabel />
        </div>

        <div className="mt-6 flex items-start gap-3 border border-line p-4 text-sm">
          <Truck className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p>
            Illustrative demo shipping rates. Choose your country in the cart to see an estimate.{" "}
            <Link href="/policies/shipping" className="underline underline-offset-4">Shipping policy</Link>
          </p>
        </div>

        <ul className="mt-8 grid gap-2 border-t border-line pt-6 text-[0.9375rem]">
          {product.highlights.map((h) => (
            <li key={h} className="flex gap-3">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 bg-ember" />
              {h}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
