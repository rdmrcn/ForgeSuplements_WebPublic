import { z } from "zod";
import { caProvinces, trDistricts, trProvinces, usStates } from "@/config/regions";
import {
  isCountryCode,
  shippingCountries,
  type AddressFieldName,
  type CountryCode,
} from "@/config/shipping";

const countryCodes = Object.keys(shippingCountries) as [CountryCode, ...CountryCode[]];

const text = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters.`);
const optionalText = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters.`).default("");

export const addressSchema = z.object({
  firstName: text(60).min(1, "Enter a first name."),
  lastName: text(60).min(1, "Enter a last name."),
  country: z.enum(countryCodes, { message: "Choose a destination country." }),
  address1: optionalText(120),
  houseNumber: optionalText(12),
  address2: optionalText(120),
  district: optionalText(80),
  city: optionalText(80),
  region: optionalText(80),
  postalCode: optionalText(12),
  deliveryNotes: optionalText(200),
});

export type AddressInput = z.infer<typeof addressSchema>;

export function regionOptionsFor(country: CountryCode): { value: string; label: string }[] | undefined {
  switch (shippingCountries[country].regionSet) {
    case "US":
      return usStates;
    case "CA":
      return caProvinces;
    case "TR":
      return trProvinces;
    default:
      return undefined;
  }
}

export function districtOptionsFor(country: CountryCode, region: string): string[] | undefined {
  if (country !== "TR") return undefined;
  return trDistricts[region];
}

const requiredMessages: Record<AddressFieldName, string> = {
  address1: "Enter your street address.",
  houseNumber: "Enter the house or building number.",
  address2: "",
  district: "Choose or enter your district.",
  city: "Enter your city.",
  region: "Choose your region.",
  postalCode: "Enter your postal code.",
  deliveryNotes: "",
};

const regionMessages: Partial<Record<CountryCode, string>> = {
  TR: "Choose your province.",
  US: "Choose your state.",
  CA: "Choose your province or territory.",
};

/** Applies the country-specific rules from `src/config/shipping.ts` to an address. */
export function validateAddressForCountry(
  address: AddressInput,
  ctx: z.RefinementCtx,
  path: (string | number)[],
): void {
  const country = shippingCountries[address.country];
  if (!country) return;

  for (const field of country.fields) {
    const value = (address[field.name] ?? "").trim();
    if (field.required && !value) {
      ctx.addIssue({
        code: "custom",
        path: [...path, field.name],
        message: field.name === "region" ? (regionMessages[country.code] ?? requiredMessages.region) : requiredMessages[field.name],
      });
    }
  }

  const postal = address.postalCode.trim().toUpperCase();
  if (postal && !new RegExp(country.postalPattern, "i").test(postal)) {
    ctx.addIssue({
      code: "custom",
      path: [...path, "postalCode"],
      message: `Enter a valid ${country.name} postal code, for example ${country.postalExample}.`,
    });
  }

  const regionOptions = regionOptionsFor(address.country);
  if (regionOptions && address.region && !regionOptions.some((o) => o.value === address.region)) {
    ctx.addIssue({ code: "custom", path: [...path, "region"], message: regionMessages[country.code] ?? "Choose a valid region." });
  }

  if (address.country === "TR" && address.district) {
    const known = districtOptionsFor("TR", address.region);
    if (known && !known.includes(address.district)) {
      ctx.addIssue({ code: "custom", path: [...path, "district"], message: "Choose a district from the list." });
    }
  }
}

/** Trims and fills derived fields. Only use on already validated data. */
export function normalizeAddress(address: AddressInput): AddressInput {
  const normalized = { ...address };
  for (const key of Object.keys(normalized) as (keyof AddressInput)[]) {
    const value = normalized[key];
    if (typeof value === "string") (normalized as Record<string, string>)[key] = value.trim().replace(/\s+/g, " ");
  }
  normalized.postalCode = normalized.postalCode.toUpperCase();
  if (!normalized.city && normalized.district) normalized.city = normalized.district;
  return normalized;
}

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Enter a phone number for the courier.")
  .max(24, "That phone number is too long.")
  .regex(/^\+?[0-9 ()\-.]+$/, "Use digits, spaces and + ( ) - only.")
  .refine((v) => v.replace(/\D/g, "").length >= 7, "Enter a valid phone number.")
  .refine((v) => v.replace(/\D/g, "").length <= 15, "Enter a valid phone number.");

export const checkoutFormSchema = z
  .object({
    email: z.string().trim().min(1, "Enter your email address.").max(120).pipe(z.email("Enter a valid email address.")),
    phone: phoneSchema,
    shipping: addressSchema,
    billingSame: z.boolean(),
    billing: addressSchema.optional(),
    shippingMethodId: z.enum(["standard", "express"], { message: "Choose a delivery method." }),
    discountCode: z.string().trim().max(32).optional(),
    acceptDemoTerms: z.boolean().refine((v) => v === true, {
      message: "Please confirm you understand this is a demo order.",
    }),
  })
  .superRefine((data, ctx) => {
    validateAddressForCountry(data.shipping, ctx, ["shipping"]);
    if (!data.billingSame) {
      if (!data.billing) {
        ctx.addIssue({ code: "custom", path: ["billing", "firstName"], message: "Enter a billing address." });
      } else {
        validateAddressForCountry(data.billing, ctx, ["billing"]);
      }
    }
  });

export type CheckoutFormValues = z.input<typeof checkoutFormSchema>;
export type CheckoutData = z.output<typeof checkoutFormSchema>;

export const orderRequestSchema = z.object({
  checkout: checkoutFormSchema,
  items: z
    .array(
      z.object({
        variantId: z.string().min(1).max(120),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1, "Your cart is empty.")
    .max(50),
  /** What the customer saw. It is compared with the server's own calculation and never trusted. */
  expectedTotalCents: z.number().int().min(0),
});

export type OrderRequest = z.infer<typeof orderRequestSchema>;

export function emptyAddress(country: CountryCode): AddressInput {
  return {
    firstName: "",
    lastName: "",
    country,
    address1: "",
    houseNumber: "",
    address2: "",
    district: "",
    city: "",
    region: "",
    postalCode: "",
    deliveryNotes: "",
  };
}

export { isCountryCode };
