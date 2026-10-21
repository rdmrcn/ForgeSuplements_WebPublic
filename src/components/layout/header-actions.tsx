"use client";

import { Heart, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { useCartCount } from "@/store/hooks";
import { useFavoritesStore } from "@/store/lists";
import { SearchOverlay } from "./search-overlay";

export function HeaderActions() {
  const [searchOpen, setSearchOpen] = useState(false);
  const count = useCartCount();
  const hydrated = useCartStore((s) => s.hydrated);
  const openCart = useCartStore((s) => s.openDrawer);
  const favorites = useFavoritesStore((s) => s.ids.length);

  const iconBtn =
    "relative inline-flex size-11 items-center justify-center rounded-xs transition-colors hover:bg-ink/6";

  return (
    <div className="ml-auto flex items-center gap-0.5">
      <button type="button" className={iconBtn} aria-label="Search products" onClick={() => setSearchOpen(true)}>
        <Search className="size-5" aria-hidden />
      </button>
      <Link href="/favorites" className={`${iconBtn} hidden xs:inline-flex`} aria-label={`Favourites${favorites ? `, ${favorites} saved` : ""}`}>
        <Heart className="size-5" aria-hidden />
        {favorites > 0 && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-ember" aria-hidden />}
      </Link>
      <button
        type="button"
        className={iconBtn}
        aria-label={`Open cart${hydrated && count ? `, ${count} item${count === 1 ? "" : "s"}` : ""}`}
        onClick={openCart}
        data-testid="cart-button"
      >
        <ShoppingBag className="size-5" aria-hidden />
        {hydrated && count > 0 && (
          <span
            data-testid="cart-count"
            className="absolute right-0.5 top-0.5 flex min-w-[1.1rem] items-center justify-center bg-ember px-1 text-[0.6875rem] font-bold leading-[1.1rem] text-ink"
          >
            {count}
          </span>
        )}
      </button>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
