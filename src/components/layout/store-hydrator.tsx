"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart";
import { useDestinationStore } from "@/store/destination";
import { useFavoritesStore, useRecentStore } from "@/store/lists";

/** Rehydrates persisted stores after mount so server and client markup match on first paint. */
export function StoreHydrator() {
  useEffect(() => {
    void Promise.resolve(useCartStore.persist.rehydrate()).then(() => useCartStore.setState({ hydrated: true }));
    void useFavoritesStore.persist.rehydrate();
    void useRecentStore.persist.rehydrate();
    void useDestinationStore.persist.rehydrate();

    const onStorage = (event: StorageEvent) => {
      if (event.key === "forge-cart-v1") void useCartStore.persist.rehydrate();
      if (event.key === "forge-favorites-v1") void useFavoritesStore.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return null;
}
