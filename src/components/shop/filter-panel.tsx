"use client";

import { useId } from "react";
import { categories } from "@/domain/catalog";
import type { BrowseFilters } from "@/domain/search";
import type { CategoryId } from "@/domain/types";

interface Props {
  filters: BrowseFilters;
  onChange: (next: BrowseFilters) => void;
  lockedCategory?: CategoryId;
  hideCategories?: boolean;
  flavors: string[];
  sizes: string[];
  priceBounds: [number, number];
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-line py-5 first:pt-0">
      <legend className="eyebrow mb-3 text-stone">{title}</legend>
      <div className="space-y-1">{children}</div>
    </fieldset>
  );
}

function Check({ label, checked, onChange, swatch }: { label: string; checked: boolean; onChange: (v: boolean) => void; swatch?: string }) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-3 py-1.5 text-[0.9375rem] hover:text-ember">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="check size-[1.125rem] shrink-0 cursor-pointer appearance-none border border-line-strong bg-white/60 checked:border-ink checked:bg-ink focus-visible:ring-2 focus-visible:ring-ember" />
      {swatch && <span aria-hidden className="size-3 rounded-full border border-black/20" style={{ background: swatch }} />}
      <span>{label}</span>
    </label>
  );
}

const toggle = <T,>(list: T[], value: T, on: boolean): T[] => (on ? [...list, value] : list.filter((v) => v !== value));

export function FilterPanel({ filters, onChange, lockedCategory, hideCategories, flavors, sizes, priceBounds }: Props) {
  const minId = useId();
  const maxId = useId();
  const set = (patch: Partial<BrowseFilters>) => onChange({ ...filters, ...patch });
  const input = "h-11 w-full border border-line-strong bg-white/60 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember";

  return (
    <div>
      {!lockedCategory && !hideCategories && (
        <Group title="Category">
          {categories.map((c) => (
            <Check key={c.id} label={c.name} checked={filters.categories.includes(c.id)} onChange={(on) => set({ categories: toggle(filters.categories, c.id, on) })} />
          ))}
        </Group>
      )}
      {flavors.length > 0 && (
        <Group title="Flavour">
          {flavors.map((f) => (
            <Check key={f} label={f} checked={filters.flavors.includes(f)} onChange={(on) => set({ flavors: toggle(filters.flavors, f, on) })} />
          ))}
        </Group>
      )}
      <Group title="Size">
        {sizes.map((s) => (
          <Check key={s} label={s} checked={filters.sizes.includes(s)} onChange={(on) => set({ sizes: toggle(filters.sizes, s, on) })} />
        ))}
      </Group>
      <Group title="Price (EUR)">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label htmlFor={minId} className="mb-1 block text-xs text-stone">Min</label>
            <input
              id={minId}
              type="number"
              inputMode="decimal"
              min={0}
              placeholder={String(Math.floor(priceBounds[0] / 100))}
              value={filters.minCents !== undefined ? filters.minCents / 100 : ""}
              onChange={(e) => set({ minCents: e.target.value === "" ? undefined : Math.max(0, Math.round(Number(e.target.value) * 100)) })}
              className={input}
            />
          </div>
          <span aria-hidden className="pb-3 text-stone">-</span>
          <div className="flex-1">
            <label htmlFor={maxId} className="mb-1 block text-xs text-stone">Max</label>
            <input
              id={maxId}
              type="number"
              inputMode="decimal"
              min={0}
              placeholder={String(Math.ceil(priceBounds[1] / 100))}
              value={filters.maxCents !== undefined ? filters.maxCents / 100 : ""}
              onChange={(e) => set({ maxCents: e.target.value === "" ? undefined : Math.max(0, Math.round(Number(e.target.value) * 100)) })}
              className={input}
            />
          </div>
        </div>
      </Group>
      <Group title="Availability">
        <Check label="In stock only" checked={filters.inStockOnly} onChange={(on) => set({ inStockOnly: on })} />
      </Group>
    </div>
  );
}
