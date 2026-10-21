"use client";

import { countryList, type CountryCode } from "@/config/shipping";
import { useDestinationStore } from "@/store/destination";

export function DestinationSelect({ id = "ship-to" }: { id?: string }) {
  const country = useDestinationStore((s) => s.country);
  const setCountry = useDestinationStore((s) => s.setCountry);
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <label htmlFor={id} className="text-stone">
        Ship to
      </label>
      <select
        id={id}
        value={country}
        onChange={(e) => setCountry(e.target.value as CountryCode)}
        className="h-9 border border-line-strong bg-white/60 px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
      >
        {countryList.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
