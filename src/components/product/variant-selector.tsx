"use client";

import { clsx } from "clsx";
import { useId } from "react";
import { formatMoney } from "@/lib/format";
import type { Product } from "@/domain/types";
import type { useVariantSelection } from "./use-variant-selection";

type Selection = ReturnType<typeof useVariantSelection>;

const chip =
  "relative flex cursor-pointer items-center gap-2 border px-3.5 py-2.5 text-sm transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-bone peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ember hover:border-ink";

export function VariantSelector({ product, selection, compact }: { product: Product; selection: Selection; compact?: boolean }) {
  const name = useId();
  const { flavor, size, setFlavor, setSize, flavors, sizes, stockFor } = selection;

  return (
    <div className={clsx("space-y-5", compact && "space-y-3")}>
      {flavors.length > 0 && (
        <fieldset>
          <legend className="mb-2 flex items-baseline gap-2 text-[0.8125rem] font-semibold uppercase tracking-[0.08em]">
            Flavour <span className="font-normal normal-case tracking-normal text-stone" data-testid="selected-flavor">{flavor}</span>
          </legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Flavour">
            {flavors.map((f) => {
              const swatch = product.variants.find((v) => v.flavor === f)?.flavorHex;
              const sold = !product.variants.some((v) => v.flavor === f && v.size === size && v.stock > 0);
              return (
                <label key={f} className="relative">
                  <input
                    type="radio"
                    name={`${name}-flavor`}
                    value={f}
                    checked={flavor === f}
                    onChange={() => setFlavor(f)}
                    className="peer sr-only"
                  />
                  <span className={clsx(chip, "border-line-strong", sold && "text-stone")}>
                    <span aria-hidden className="size-3.5 shrink-0 rounded-full border border-black/20" style={{ background: swatch }} />
                    <span className={clsx(sold && "line-through decoration-1")}>{f}</span>
                    {sold && <span className="sr-only"> (sold out in this size)</span>}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {sizes.length > 1 && (
        <fieldset>
          <legend className="mb-2 flex items-baseline gap-2 text-[0.8125rem] font-semibold uppercase tracking-[0.08em]">
            Size <span className="font-normal normal-case tracking-normal text-stone" data-testid="selected-size">{size}</span>
          </legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
            {sizes.map((s) => {
              const v = product.variants.find((x) => x.size === s && x.flavor === flavor) ?? product.variants.find((x) => x.size === s)!;
              const sold = stockFor(flavor, s) <= 0;
              return (
                <label key={s} className="relative">
                  <input type="radio" name={`${name}-size`} value={s} checked={size === s} onChange={() => setSize(s)} className="peer sr-only" />
                  <span className={clsx(chip, "min-w-[6.5rem] flex-col items-start gap-0 border-line-strong", sold && "text-stone")}>
                    <span className={clsx("font-semibold", sold && "line-through decoration-1")}>{s}</span>
                    <span className="text-xs opacity-80">{sold ? "Sold out" : formatMoney(v.priceCents)}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}
    </div>
  );
}
