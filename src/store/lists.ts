"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getProductById } from "@/domain/catalog";

interface FavoritesState {
  ids: string[];
  toggle: (productId: string) => boolean;
  has: (productId: string) => boolean;
}

const validIds = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string" && Boolean(getProductById(v))) : [];

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId) => {
        const exists = get().ids.includes(productId);
        set({ ids: exists ? get().ids.filter((id) => id !== productId) : [...get().ids, productId] });
        return !exists;
      },
      has: (productId) => get().ids.includes(productId),
    }),
    {
      name: "forge-favorites-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({ ids: s.ids }),
      merge: (persisted, current) => ({ ...current, ids: validIds((persisted as { ids?: unknown })?.ids) }),
    },
  ),
);

interface RecentState {
  ids: string[];
  record: (productId: string) => void;
}

export const useRecentStore = create<RecentState>()(
  persist(
    (set, get) => ({
      ids: [],
      record: (productId) => {
        const next = [productId, ...get().ids.filter((id) => id !== productId)].slice(0, 8);
        if (next.join() !== get().ids.join()) set({ ids: next });
      },
    }),
    {
      name: "forge-recent-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({ ids: s.ids }),
      merge: (persisted, current) => ({ ...current, ids: validIds((persisted as { ids?: unknown })?.ids) }),
    },
  ),
);
