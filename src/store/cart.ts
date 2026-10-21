"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { MAX_LINE_QUANTITY, getVariant, resolveLine } from "@/domain/catalog";
import { evaluateDiscount, normalizeDiscountCode, priceCart } from "@/domain/pricing";
import type { CartLine } from "@/domain/types";

export type AddResult =
  | { ok: true; added: number; capped: boolean; quantity: number }
  | { ok: false; reason: string };

interface CartState {
  lines: CartLine[];
  discountCode: string | null;
  hydrated: boolean;
  drawerOpen: boolean;
  add: (variantId: string, quantity?: number) => AddResult;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  applyCode: (code: string) => { ok: true } | { ok: false; reason: string };
  removeCode: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

/** Drops unknown variants and clamps quantities to what the catalog can currently supply. */
export function sanitizeLines(lines: unknown): CartLine[] {
  if (!Array.isArray(lines)) return [];
  const out = new Map<string, number>();
  for (const raw of lines) {
    if (!raw || typeof raw !== "object") continue;
    const { variantId, quantity } = raw as Partial<CartLine>;
    if (typeof variantId !== "string" || typeof quantity !== "number") continue;
    const resolved = resolveLine(variantId, quantity + (out.get(variantId) ?? 0));
    if (resolved && resolved.quantity > 0) out.set(variantId, resolved.quantity);
  }
  return [...out].map(([variantId, quantity]) => ({ variantId, quantity }));
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      discountCode: null,
      hydrated: false,
      drawerOpen: false,

      add: (variantId, quantity = 1) => {
        const entry = getVariant(variantId);
        if (!entry) return { ok: false, reason: "That item is no longer available." };
        const { variant } = entry;
        if (variant.stock <= 0) return { ok: false, reason: "That option is sold out." };

        const requested = Math.max(1, Math.floor(quantity));
        const current = get().lines.find((l) => l.variantId === variantId)?.quantity ?? 0;
        const max = Math.min(variant.stock, MAX_LINE_QUANTITY);
        const next = Math.min(current + requested, max);
        if (next === current) {
          return { ok: false, reason: `You already have the maximum of ${max} in your cart.` };
        }
        set((state) => ({
          lines: state.lines.some((l) => l.variantId === variantId)
            ? state.lines.map((l) => (l.variantId === variantId ? { ...l, quantity: next } : l))
            : [...state.lines, { variantId, quantity: next }],
        }));
        return { ok: true, added: next - current, capped: next - current < requested, quantity: next };
      },

      setQuantity: (variantId, quantity) => {
        const resolved = resolveLine(variantId, quantity);
        if (!resolved || resolved.quantity <= 0) {
          get().remove(variantId);
          return;
        }
        set((state) => ({
          lines: state.lines.map((l) => (l.variantId === variantId ? { ...l, quantity: resolved.quantity } : l)),
        }));
      },

      remove: (variantId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.variantId !== variantId) })),

      clear: () => set({ lines: [], discountCode: null }),

      applyCode: (code) => {
        const normalized = normalizeDiscountCode(code);
        if (!normalized) return { ok: false, reason: "Enter a discount code." };
        const { subtotalCents } = priceCart({ lines: get().lines });
        const result = evaluateDiscount(normalized, subtotalCents);
        if (result.status !== "applied") {
          return { ok: false, reason: result.status === "invalid" ? result.reason : "Enter a discount code." };
        }
        set({ discountCode: normalized });
        return { ok: true };
      },

      removeCode: () => set({ discountCode: null }),
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
    }),
    {
      name: "forge-cart-v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ lines: state.lines, discountCode: state.discountCode }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Pick<CartState, "lines" | "discountCode">>;
        return {
          ...current,
          lines: sanitizeLines(p.lines),
          discountCode: typeof p.discountCode === "string" ? normalizeDiscountCode(p.discountCode) || null : null,
        };
      },
    },
  ),
);
