"use client";

import { Tag, X } from "lucide-react";
import { useId, useState } from "react";
import { discounts } from "@/config/discounts";
import type { PricingResult } from "@/domain/pricing";
import { useCartStore } from "@/store/cart";

export function DiscountForm({ pricing, light }: { pricing: PricingResult; light?: boolean }) {
  const id = useId();
  const applyCode = useCartStore((s) => s.applyCode);
  const removeCode = useCartStore((s) => s.removeCode);
  const storedCode = useCartStore((s) => s.discountCode);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const applied = pricing.discount.status === "applied" ? pricing.discount : null;
  const staleCode = storedCode && !applied;

  if (applied) {
    return (
      <div className="flex items-center justify-between gap-3 border border-line-strong px-3 py-2.5 text-sm" data-testid="discount-applied">
        <span className="flex items-center gap-2">
          <Tag className="size-4 text-ember" aria-hidden />
          <span>
            <strong>{applied.config.code}</strong> applied: {applied.config.description}
          </span>
        </span>
        <button type="button" onClick={removeCode} className="inline-flex size-8 items-center justify-center hover:bg-ink/8" aria-label="Remove discount code">
          <X className="size-4" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const result = applyCode(value);
          setError(result.ok ? null : result.reason);
          if (result.ok) setValue("");
        }}
        className="flex gap-2"
      >
        <label htmlFor={id} className="sr-only">
          Discount code
        </label>
        <input
          id={id}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          placeholder="Discount code"
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : `${id}-hint`}
          className={`h-11 min-w-0 flex-1 border bg-white/60 px-3 text-sm uppercase placeholder:normal-case focus:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember ${error ? "border-danger" : "border-line-strong"} ${light ? "" : ""}`}
        />
        <button type="submit" className="h-11 border border-ink px-4 text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-ink hover:text-bone">
          Apply
        </button>
      </form>
      {error ? (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      ) : (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-stone">
          Demo codes: {discounts.map((d) => d.code).join(", ")}.
        </p>
      )}
      {staleCode && (
        <p role="status" className="mt-1.5 text-xs text-danger">
          {storedCode} is saved but does not apply to this cart right now.
        </p>
      )}
    </div>
  );
}
