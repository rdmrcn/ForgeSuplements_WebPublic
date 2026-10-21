"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_COUNTRY, isCountryCode, type CountryCode, type ShippingMethodId } from "@/config/shipping";

interface DestinationState {
  country: CountryCode;
  methodId: ShippingMethodId;
  setCountry: (country: CountryCode) => void;
  setMethod: (method: ShippingMethodId) => void;
}

export const useDestinationStore = create<DestinationState>()(
  persist(
    (set) => ({
      country: DEFAULT_COUNTRY,
      methodId: "standard",
      setCountry: (country) => set({ country }),
      setMethod: (methodId) => set({ methodId }),
    }),
    {
      name: "forge-destination-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({ country: s.country, methodId: s.methodId }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<DestinationState>;
        return {
          ...current,
          country: typeof p.country === "string" && isCountryCode(p.country) ? p.country : current.country,
          methodId: p.methodId === "express" ? "express" : "standard",
        };
      },
    },
  ),
);
