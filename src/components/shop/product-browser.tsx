"use client";

import { SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { categories, products as allProducts } from "@/domain/catalog";
import {
  countActiveFilters,
  defaultFilters,
  filterProducts,
  parseFilters,
  serializeFilters,
  sortLabels,
  type BrowseFilters,
  type SortKey,
} from "@/domain/search";
import type { CategoryId } from "@/domain/types";
import { formatMoney, pluralize } from "@/lib/format";
import { ProductCard } from "@/components/product/product-card";
import { Button, LinkButton } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { FilterPanel } from "./filter-panel";

interface Props {
  lockedCategory?: CategoryId;
  showSearch?: boolean;
}

export function ProductBrowser({ lockedCategory, showSearch }: Props) {
  const pathname = usePathname();
  const params = useSearchParams();
  const urlKey = params.toString();
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Local state is the source of truth so controls respond instantly; the URL mirrors it
  // (shareable links) and external navigation, such as a new header search, flows back in.
  const [filters, setFilters] = useState<BrowseFilters>(() => parseFilters(new URLSearchParams(urlKey), lockedCategory));
  const [seenKey, setSeenKey] = useState(urlKey);
  const [pushedKey, setPushedKey] = useState(urlKey);
  if (urlKey !== seenKey) {
    setSeenKey(urlKey);
    if (urlKey !== pushedKey) {
      setPushedKey(urlKey);
      setFilters(parseFilters(new URLSearchParams(urlKey), lockedCategory));
    }
  }

  const scope = useMemo(
    () => (lockedCategory ? allProducts.filter((p) => p.categoryId === lockedCategory) : allProducts),
    [lockedCategory],
  );
  const facets = useMemo(() => {
    const flavors = new Set<string>();
    const sizes = new Set<string>();
    let min = Infinity;
    let max = 0;
    for (const p of scope) {
      for (const v of p.variants) {
        if (v.flavor) flavors.add(v.flavor);
        sizes.add(v.size);
        min = Math.min(min, v.priceCents);
        max = Math.max(max, v.priceCents);
      }
    }
    return { flavors: [...flavors], sizes: [...sizes], bounds: [min, max] as [number, number] };
  }, [scope]);

  const results = useMemo(() => filterProducts(scope, filters), [scope, filters]);
  const active = countActiveFilters(filters, lockedCategory);

  function update(next: BrowseFilters) {
    const qs = serializeFilters(next, lockedCategory).toString();
    setFilters(next);
    setPushedKey(qs);
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  }

  const reset = () => update({ ...defaultFilters, q: filters.q, sort: filters.sort });

  const chips: { key: string; label: string; remove: () => void }[] = [
    ...(lockedCategory ? [] : filters.categories.map((c) => ({ key: `c-${c}`, label: categories.find((x) => x.id === c)?.name ?? c, remove: () => update({ ...filters, categories: filters.categories.filter((x) => x !== c) }) }))),
    ...filters.flavors.map((f) => ({ key: `f-${f}`, label: f, remove: () => update({ ...filters, flavors: filters.flavors.filter((x) => x !== f) }) })),
    ...filters.sizes.map((s) => ({ key: `s-${s}`, label: s, remove: () => update({ ...filters, sizes: filters.sizes.filter((x) => x !== s) }) })),
    ...(filters.minCents !== undefined ? [{ key: "min", label: `From ${formatMoney(filters.minCents)}`, remove: () => update({ ...filters, minCents: undefined }) }] : []),
    ...(filters.maxCents !== undefined ? [{ key: "max", label: `Up to ${formatMoney(filters.maxCents)}`, remove: () => update({ ...filters, maxCents: undefined }) }] : []),
    ...(filters.inStockOnly ? [{ key: "stock", label: "In stock", remove: () => update({ ...filters, inStockOnly: false }) }] : []),
  ];

  const panel = (
    <FilterPanel filters={filters} onChange={update} lockedCategory={lockedCategory} flavors={facets.flavors} sizes={facets.sizes} priceBounds={facets.bounds} />
  );

  return (
    <div className="container-x pb-8">
      {showSearch && (
        <form role="search" onSubmit={(e) => e.preventDefault()} className="mb-8 border-b-2 border-ink pb-3">
          <label htmlFor="search-page-input" className="sr-only">Search products</label>
          <input
            id="search-page-input"
            type="search"
            value={filters.q}
            onChange={(e) => update({ ...filters, q: e.target.value })}
            placeholder="Search products, flavours, sizes"
            autoComplete="off"
            className="display w-full bg-transparent text-[clamp(2rem,6vw,4rem)] placeholder:text-ink/25 focus:outline-none"
          />
        </form>
      )}

      <div className="sticky top-[var(--header-h)] z-20 -mx-[clamp(1rem,3.2vw,3rem)] flex items-center justify-between gap-3 border-b border-line bg-bone/95 px-[clamp(1rem,3.2vw,3rem)] py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setFiltersOpen(true)} aria-haspopup="dialog">
            <SlidersHorizontal className="size-4" aria-hidden /> Filters{active > 0 && ` (${active})`}
          </Button>
          <p className="text-sm text-stone" aria-live="polite" data-testid="result-count">
            {pluralize(results.length, "product")}
            {filters.q.trim() && <> for &ldquo;{filters.q.trim()}&rdquo;</>}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="sort" className="hidden text-stone sm:block">Sort by</label>
          <select
            id="sort"
            value={filters.sort}
            onChange={(e) => update({ ...filters, sort: e.target.value as SortKey })}
            className="h-10 border border-line-strong bg-transparent px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
          >
            {(Object.keys(sortLabels) as SortKey[]).map((k) => (
              <option key={k} value={k}>{sortLabels[k]}</option>
            ))}
          </select>
        </div>
      </div>

      {chips.length > 0 && (
        <ul className="flex flex-wrap items-center gap-2 py-4" aria-label="Active filters" data-testid="active-filters">
          {chips.map((c) => (
            <li key={c.key}>
              <button type="button" onClick={c.remove} className="inline-flex items-center gap-1.5 border border-ink bg-ink py-1 pl-3 pr-2 text-xs font-medium text-bone transition-colors hover:bg-ember hover:text-ink" aria-label={`Remove filter ${c.label}`}>
                {c.label} <X className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
          <li>
            <button type="button" onClick={reset} className="px-2 py-1 text-xs font-semibold uppercase tracking-wider underline underline-offset-4" data-testid="reset-filters">
              Reset filters
            </button>
          </li>
        </ul>
      )}

      <div className="grid gap-10 pt-6 lg:grid-cols-[15rem_1fr] xl:grid-cols-[16rem_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-[calc(var(--header-h)+5rem)] max-h-[calc(100dvh-var(--header-h)-6rem)] overflow-y-auto pr-3">{panel}</div>
        </aside>

        <section aria-label="Products">
          {results.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4" data-testid="product-grid">
              {results.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-xl py-16 text-center" data-testid="empty-results">
              <p className="eyebrow text-stone">No results</p>
              <h2 className="display mt-3 text-5xl">Nothing matches that</h2>
              <p className="mt-3 text-stone">
                {filters.q.trim() ? <>We could not find anything for &ldquo;{filters.q.trim()}&rdquo; with these filters.</> : "No products match the selected filters."} Try removing a filter or browsing a category.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {active > 0 || filters.q ? (
                  <Button onClick={() => update({ ...defaultFilters })}>Clear search and filters</Button>
                ) : null}
                <LinkButton href="/shop" variant="outline">Browse all products</LinkButton>
              </div>
              <ul className="mt-8 flex flex-wrap justify-center gap-2 text-sm">
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link href={`/shop/${c.slug}`} className="border border-line-strong px-3 py-1.5 hover:bg-ink hover:text-bone">{c.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>

      <Drawer open={filtersOpen} onClose={() => setFiltersOpen(false)} side="left" label="Filters" className="flex w-[min(24rem,92vw)] flex-col bg-bone">
        <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-line px-5">
          <h2 className="display text-2xl">Filters</h2>
          <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters" className="inline-flex size-11 items-center justify-center hover:bg-ink/6">
            <X className="size-6" aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{panel}</div>
        <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-line p-4">
          <Button variant="outline" onClick={reset}>Reset</Button>
          <Button onClick={() => setFiltersOpen(false)}>Show {results.length}</Button>
        </div>
      </Drawer>
    </div>
  );
}
