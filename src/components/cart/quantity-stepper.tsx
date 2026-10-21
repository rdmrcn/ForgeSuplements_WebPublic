"use client";

import { Minus, Plus } from "lucide-react";

interface Props {
  value: number;
  min?: number;
  max: number;
  onChange: (next: number) => void;
  label: string;
  size?: "sm" | "md";
}

export function QuantityStepper({ value, min = 1, max, onChange, label, size = "md" }: Props) {
  const btn = `inline-flex items-center justify-center transition-colors hover:bg-ink hover:text-bone disabled:pointer-events-none disabled:opacity-30 ${size === "sm" ? "size-8" : "size-11"}`;
  return (
    <div role="group" aria-label={`Quantity for ${label}`} className="inline-flex items-center border border-line-strong">
      <button type="button" className={btn} aria-label={`Decrease quantity of ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)}>
        <Minus className="size-4" aria-hidden />
      </button>
      <output aria-live="polite" className={`min-w-8 text-center font-semibold tabular-nums ${size === "sm" ? "text-sm" : ""}`}>
        {value}
      </output>
      <button type="button" className={btn} aria-label={`Increase quantity of ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
