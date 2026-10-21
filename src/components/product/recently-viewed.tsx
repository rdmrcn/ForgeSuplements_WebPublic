"use client";

import { getProductById } from "@/domain/catalog";
import type { Product } from "@/domain/types";
import { useRecentStore } from "@/store/lists";
import { ProductCard } from "./product-card";

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const ids = useRecentStore((s) => s.ids);
  const items = ids
    .filter((id) => id !== excludeId)
    .map((id) => getProductById(id))
    .filter((p): p is Product => Boolean(p))
    .slice(0, 4);
  if (items.length === 0) return null;
  return (
    <section className="container-x py-12" aria-labelledby="recent-heading">
      <h2 id="recent-heading" className="display mb-6 text-4xl">Recently viewed</h2>
      <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
        {items.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}
