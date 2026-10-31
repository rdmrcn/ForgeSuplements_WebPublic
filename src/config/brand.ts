/**
 * Central brand configuration. Change the name, slogan, colours or currency
 * here and the storefront, packaging renders, metadata and emails follow.
 *
 * FORGE is a provisional, fictional brand name. It has NOT been cleared as a
 * trademark and should be replaced or legally checked before any real launch.
 */
export const brand = {
  name: "FORGE",
  owner: "Reha Demircan",,
  slogan: "Built for the work.",
  tagline: "Sports nutrition for people who train on purpose.",
  description:
    "FORGE is a fictional, premium sports nutrition brand and a portfolio-grade e-commerce demo: protein, creatine, pre-workout, aminos and daily essentials.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4317",
  locale: "en",
  colors: {
    ink: "#0b0b0a",
    charcoal: "#161615",
    graphite: "#252523",
    bone: "#f4f0e8",
    sand: "#e5ded0",
    stone: "#77726a",
    accent: "#ff5a1f",
  },
  currency: {
    code: "EUR",
    locale: "en-IE",
  },
  contact: {
    email: "support@forge-demo.example",
    phone: "Phone support is not available in this demo",
    hours: "Mon-Fri, 09:00-17:00 CET (demo)",
    address: ["FORGE Nutrition (fictional)", "12 Anvil Lane", "Placeholder City"],
  },
  announcements: [
    "Demo store: no payments are taken and no orders are shipped.",
    "Illustrative free shipping on standard delivery above the threshold for your country.",
    "Code FORGE10 gives 10% off in the demo checkout.",
  ],
} as const;

export type Brand = typeof brand;
