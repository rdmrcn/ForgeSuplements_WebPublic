"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { getVariant } from "@/domain/catalog";
import type { ResolvedLine } from "@/domain/types";
import { formatMoney } from "@/lib/format";
import { PackShot } from "@/components/product/pack-shot";
import { useCartStore } from "@/store/cart";
import { QuantityStepper } from "./quantity-stepper";

export function CartLineItem({ line, compact, onNavigate }: { line: ResolvedLine; compact?: boolean; onNavigate?: () => void }) {
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const entry = getVariant(line.variantId);
  const label = `${line.productTitle}, ${line.variantLabel}`;

  return (
    <li className="flex gap-4 py-5" data-testid="cart-line" data-variant-id={line.variantId}>
      <Link
        href={`/products/${line.productSlug}`}
        onClick={onNavigate}
        className={`relative block shrink-0 overflow-hidden bg-sand/70 ${compact ? "size-24" : "size-28 sm:size-36"}`}
        aria-label={`View ${line.productTitle}`}
      >
        {entry && <PackShot product={entry.product} variant={entry.variant} className="absolute inset-0 size-full scale-125" bare />}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/products/${line.productSlug}`} onClick={onNavigate} className="display block text-xl leading-tight hover:text-ember sm:text-2xl">
              {line.productTitle}
            </Link>
            <p className="mt-0.5 text-sm text-stone" data-testid="cart-line-variant">{line.variantLabel}</p>
          </div>
          <p className="shrink-0 font-semibold tabular-nums">{formatMoney(line.lineTotalCents)}</p>
        </div>
        <p className="mt-0.5 text-xs text-stone">{formatMoney(line.unitPriceCents)} each</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <QuantityStepper
            value={line.quantity}
            max={line.maxQuantity}
            onChange={(n) => setQuantity(line.variantId, n)}
            label={label}
            size={compact ? "sm" : "md"}
          />
          <button
            type="button"
            onClick={() => remove(line.variantId)}
            className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-stone hover:text-danger"
            aria-label={`Remove ${label} from cart`}
          >
            <Trash2 className="size-4" aria-hidden /> Remove
          </button>
        </div>
        {line.quantity >= line.maxQuantity && <p className="mt-2 text-xs text-stone">Maximum available quantity reached.</p>}
      </div>
    </li>
  );
}
