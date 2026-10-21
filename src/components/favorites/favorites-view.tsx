"use client";

import { getProductById } from "@/domain/catalog";
import type { Product } from "@/domain/types";
import { LinkButton } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { useFavoritesStore } from "@/store/lists";

export function FavoritesView() {
  const ids = useFavoritesStore((s) => s.ids);
  const items = ids.map((id) => getProductById(id)).filter((p): p is Product => Boolean(p));

  if (items.length === 0) {
    return (
      <div className="container-x pb-24" data-testid="favorites-empty">
        <p className="max-w-md text-lg text-ink/70">Nothing saved yet. Tap the heart on any product to keep it here. Favourites are stored in this browser only.</p>
        <LinkButton href="/shop" className="mt-6">Browse products</LinkButton>
      </div>
    );
  }
  return (
    <div className="container-x grid grid-cols-2 gap-x-3 gap-y-10 pb-20 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
      {items.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} />
      ))}
    </div>
  );
}
