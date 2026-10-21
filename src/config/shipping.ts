/**
 * Shipping configuration.
 *
 * ALL RATES, THRESHOLDS AND DELIVERY ESTIMATES BELOW ARE ILLUSTRATIVE DEMO
 * VALUES. They are not live carrier quotes, and they do not include customs,
 * import duties, VAT or other taxes. Availability of food supplements and
 * their ingredients varies by country and must be verified before selling
 * into any destination.
 *
 * To add a destination: add its code to `CountryCode`, add an entry to
 * `shippingCountries`, and (optionally) a region list in `src/config/regions.ts`.
 */

export type CountryCode = "TR" | "US" | "CA" | "DE" | "AT" | "GB";
export type ShippingMethodId = "standard" | "express";

export interface ShippingMethodConfig {
  id: ShippingMethodId;
  label: string;
  description: string;
  baseCents: number;
  /** Parcel weight (g) covered by the base rate. */
  includedGrams: number;
  /** Added for every started kilogram above `includedGrams`. */
  perExtraKgCents: number;
  /** Subtotal after discounts at which this method becomes free. */
  freeOverCents?: number;
  etaBusinessDays: [number, number];
}

export type AddressFieldName =
  | "address1"
  | "houseNumber"
  | "address2"
  | "district"
  | "city"
  | "region"
  | "postalCode"
  | "deliveryNotes";

export interface AddressFieldConfig {
  name: AddressFieldName;
  label: string;
  required: boolean;
  type?: "text" | "select";
  autoComplete?: string;
  placeholder?: string;
  hint?: string;
  maxLength?: number;
  /** Layout hint for the checkout grid. */
  width?: "full" | "half" | "third";
}

export interface CountryConfig {
  code: CountryCode;
  name: string;
  /** Pattern a postal code must match (case-insensitive). Intentionally permissive. */
  postalPattern: string;
  postalExample: string;
  phoneDialCode: string;
  fields: AddressFieldConfig[];
  regionSet?: "US" | "CA" | "TR";
  methods: ShippingMethodConfig[];
  notices: string[];
}

/** Packaging overhead added to every parcel for the weight calculation. */
export const PARCEL_OVERHEAD_GRAMS = 250;

const standard = (
  baseCents: number,
  freeOverCents: number,
  eta: [number, number],
  extra: Partial<ShippingMethodConfig> = {},
): ShippingMethodConfig => ({
  id: "standard",
  label: "Standard delivery",
  description: "Tracked parcel to your door.",
  baseCents,
  includedGrams: 2000,
  perExtraKgCents: 150,
  freeOverCents,
  etaBusinessDays: eta,
  ...extra,
});

const express = (
  baseCents: number,
  eta: [number, number],
  extra: Partial<ShippingMethodConfig> = {},
): ShippingMethodConfig => ({
  id: "express",
  label: "Express delivery",
  description: "Prioritised handling and faster transit.",
  baseCents,
  includedGrams: 2000,
  perExtraKgCents: 250,
  etaBusinessDays: eta,
  ...extra,
});

const streetFields: AddressFieldConfig[] = [
  { name: "address1", label: "Street address", required: true, autoComplete: "address-line1", maxLength: 120 },
  { name: "address2", label: "Apartment, suite, unit", required: false, autoComplete: "address-line2", maxLength: 120 },
];

export const shippingCountries: Record<CountryCode, CountryConfig> = {
  TR: {
    code: "TR",
    name: "Türkiye",
    postalPattern: "^\\d{5}$",
    postalExample: "34710",
    phoneDialCode: "+90",
    regionSet: "TR",
    fields: [
      { name: "region", label: "Province (İl)", required: true, type: "select", autoComplete: "address-level1", width: "half" },
      { name: "district", label: "District (İlçe)", required: true, type: "select", autoComplete: "address-level2", width: "half" },
      { name: "postalCode", label: "Postal code", required: true, autoComplete: "postal-code", width: "half", placeholder: "34710" },
      { name: "address1", label: "Neighbourhood and street", required: true, autoComplete: "address-line1", hint: "Mahalle, cadde or sokak", maxLength: 120 },
      { name: "houseNumber", label: "Building number", required: true, width: "half", maxLength: 12 },
      { name: "address2", label: "Apartment, floor, door number", required: false, width: "half", autoComplete: "address-line2", maxLength: 60 },
      { name: "deliveryNotes", label: "Delivery instructions", required: false, hint: "Optional. For example: door code, landmark.", maxLength: 200 },
    ],
    methods: [
      standard(490, 6000, [2, 4], { includedGrams: 3000 }),
      express(1190, [1, 2]),
    ],
    notices: [
      "Türkiye district data in this demo is partial. Provinces without a built-in district list use a free-text district field.",
      "Import rules for food supplements are not verified in this demo.",
    ],
  },
  US: {
    code: "US",
    name: "United States",
    postalPattern: "^\\d{5}(-\\d{4})?$",
    postalExample: "94103",
    phoneDialCode: "+1",
    regionSet: "US",
    fields: [
      ...streetFields,
      { name: "city", label: "City", required: true, autoComplete: "address-level2", width: "third" },
      { name: "region", label: "State", required: true, type: "select", autoComplete: "address-level1", width: "third" },
      { name: "postalCode", label: "ZIP code", required: true, autoComplete: "postal-code", width: "third", placeholder: "94103" },
    ],
    methods: [standard(1490, 12000, [6, 10]), express(3290, [3, 5])],
    notices: [
      "Illustrative rates. Customs, duties and taxes are not calculated in this demo.",
      "Supplement import and labelling rules (FDA) must be verified before selling.",
    ],
  },
  CA: {
    code: "CA",
    name: "Canada",
    postalPattern: "^[ABCEGHJ-NPRSTVXY]\\d[ABCEGHJ-NPRSTV-Z][ -]?\\d[ABCEGHJ-NPRSTV-Z]\\d$",
    postalExample: "M5V 2T6",
    phoneDialCode: "+1",
    regionSet: "CA",
    fields: [
      ...streetFields,
      { name: "city", label: "City", required: true, autoComplete: "address-level2", width: "third" },
      { name: "region", label: "Province or territory", required: true, type: "select", autoComplete: "address-level1", width: "third" },
      { name: "postalCode", label: "Postal code", required: true, autoComplete: "postal-code", width: "third", placeholder: "M5V 2T6" },
    ],
    methods: [standard(1490, 12000, [6, 10]), express(3490, [3, 5])],
    notices: [
      "Illustrative rates. Customs, duties and taxes are not calculated in this demo.",
      "Natural health product regulations (Health Canada) must be verified before selling.",
    ],
  },
  DE: {
    code: "DE",
    name: "Germany",
    postalPattern: "^\\d{5}$",
    postalExample: "10115",
    phoneDialCode: "+49",
    fields: [
      { name: "address1", label: "Street", required: true, autoComplete: "address-line1", width: "half", maxLength: 100 },
      { name: "houseNumber", label: "House number", required: true, width: "half", maxLength: 12 },
      { name: "address2", label: "Additional address information", required: false, autoComplete: "address-line2", hint: "Optional. For example: c/o, Hinterhaus, floor.", maxLength: 120 },
      { name: "postalCode", label: "Postal code (PLZ)", required: true, autoComplete: "postal-code", width: "half", placeholder: "10115" },
      { name: "city", label: "City", required: true, autoComplete: "address-level2", width: "half" },
    ],
    methods: [standard(590, 6000, [3, 5]), express(1390, [1, 3])],
    notices: ["Illustrative rates. VAT handling is not calculated in this demo."],
  },
  AT: {
    code: "AT",
    name: "Austria",
    postalPattern: "^\\d{4}$",
    postalExample: "1010",
    phoneDialCode: "+43",
    fields: [
      { name: "address1", label: "Street", required: true, autoComplete: "address-line1", width: "half", maxLength: 100 },
      { name: "houseNumber", label: "House number", required: true, width: "half", maxLength: 12 },
      { name: "address2", label: "Stiege, floor, door (Top)", required: false, autoComplete: "address-line2", hint: "Optional. For example: Stiege 2, Top 14.", maxLength: 120 },
      { name: "postalCode", label: "Postal code (PLZ)", required: true, autoComplete: "postal-code", width: "half", placeholder: "1010" },
      { name: "city", label: "City", required: true, autoComplete: "address-level2", width: "half" },
    ],
    methods: [standard(690, 7000, [3, 6]), express(1490, [2, 3])],
    notices: ["Illustrative rates. VAT handling is not calculated in this demo."],
  },
  GB: {
    code: "GB",
    name: "United Kingdom",
    postalPattern: "^[A-Z]{1,2}\\d[A-Z\\d]?\\s?\\d[A-Z]{2}$",
    postalExample: "SW1A 1AA",
    phoneDialCode: "+44",
    fields: [
      { name: "address1", label: "Address line 1", required: true, autoComplete: "address-line1", maxLength: 120 },
      { name: "address2", label: "Address line 2", required: false, autoComplete: "address-line2", maxLength: 120 },
      { name: "city", label: "Town or city", required: true, autoComplete: "address-level2", width: "half" },
      { name: "region", label: "County (optional)", required: false, autoComplete: "address-level1", width: "half", maxLength: 60 },
      { name: "postalCode", label: "Postcode", required: true, autoComplete: "postal-code", width: "half", placeholder: "SW1A 1AA" },
    ],
    methods: [standard(990, 8000, [4, 7]), express(1990, [2, 3])],
    notices: [
      "Illustrative rates. Post-Brexit customs and VAT handling are not calculated in this demo.",
    ],
  },
};

export const countryList: CountryConfig[] = Object.values(shippingCountries).sort((a, b) =>
  a.name.localeCompare(b.name),
);

export const DEFAULT_COUNTRY: CountryCode = "TR";

export function isCountryCode(value: string): value is CountryCode {
  return value in shippingCountries;
}

/** Hooks for future live carrier integrations. See src/server/shipping/carrier.ts. */
export const carrierIntegration = {
  provider: "config-rates",
  note: "Rates come from this file. Implement a CarrierAdapter to fetch live quotes.",
} as const;
