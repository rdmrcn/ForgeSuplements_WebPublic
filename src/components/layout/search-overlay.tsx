"use client";

import { ArrowUpRight, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { popularSearches } from "@/config/navigation";
import { minPrice, products } from "@/domain/catalog";
import { suggestProducts } from "@/domain/search";
import { formatMoney } from "@/lib/format";
import { PackShot } from "@/components/product/pack-shot";
import { Drawer } from "@/components/ui/drawer";

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const results = trimmed ? suggestProducts(products, trimmed, 5) : [];

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 60);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  function go(q: string) {
    const value = q.trim();
    if (!value) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(value)}`);
  }

  return (
    <Drawer open={open} onClose={onClose} side="top" label="Search products" className="max-h-[92dvh] overflow-y-auto bg-bone">
      <div className="container-x py-5 sm:py-8">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            go(query);
          }}
          className="flex items-center gap-3 border-b-2 border-ink pb-3"
        >
          <Search className="size-6 shrink-0" aria-hidden />
          <label htmlFor="site-search" className="sr-only">
            Search products
          </label>
          <input
            id="site-search"
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            autoComplete="off"
            placeholder="Search whey, creatine, raspberry..."
            className="display min-w-0 flex-1 bg-transparent text-[clamp(1.6rem,5vw,3rem)] placeholder:text-ink/25 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          <button type="button" onClick={onClose} aria-label="Close search" className="inline-flex size-11 items-center justify-center hover:bg-ink/6">
            <X className="size-6" aria-hidden />
          </button>
        </form>

        <div className="grid gap-8 py-6 lg:grid-cols-[1fr_2fr]" aria-live="polite">
          <div>
            <p className="eyebrow mb-3 text-stone">Popular searches</p>
            <ul className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <li key={term}>
                  <button
                    type="button"
                    onClick={() => go(term)}
                    className="border border-line-strong px-3 py-1.5 text-sm transition-colors hover:bg-ink hover:text-bone"
                  >
                    {term}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            {trimmed ? (
              results.length > 0 ? (
                <>
                  <p className="eyebrow mb-3 text-stone">
                    {results.length} suggestion{results.length === 1 ? "" : "s"}
                  </p>
                  <ul className="divide-y divide-line border-y border-line">
                    {results.map((p) => (
                      <li key={p.id}>
                        <Link href={`/products/${p.slug}`} onClick={onClose} className="group flex items-center gap-4 py-3">
                          <span className="block size-16 shrink-0 bg-sand/70">
                            <PackShot product={p} className="size-full scale-125" bare />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="display block truncate text-xl leading-tight group-hover:text-ember">{p.title}</span>
                            <span className="block truncate text-sm text-stone">{p.tagline}</span>
                          </span>
                          <span className="text-sm font-semibold">from {formatMoney(minPrice(p))}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <button type="button" onClick={() => go(query)} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider hover:text-ember">
                    See all results for &ldquo;{trimmed}&rdquo; <ArrowUpRight className="size-4" aria-hidden />
                  </button>
                </>
              ) : (
                <p className="py-6 text-stone">
                  Nothing matches &ldquo;{trimmed}&rdquo;. Try a product type such as whey, creatine or omega, or browse the{" "}
                  <Link href="/shop" onClick={onClose} className="underline underline-offset-4">
                    full range
                  </Link>
                  .
                </p>
              )
            ) : (
              <p className="py-2 text-stone">Start typing to see matching products, flavours and sizes.</p>
            )}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
