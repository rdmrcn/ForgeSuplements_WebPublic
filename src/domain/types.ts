export type CategoryId =
  | "protein"
  | "creatine"
  | "pre-workout"
  | "amino-acids"
  | "mass-gainers"
  | "carnitine-energy"
  | "daily-health";

export type GoalId = "mass-gain" | "muscle-gain" | "fat-burn" | "performance" | "health";

export type PackKind = "tub" | "pouch" | "bottle" | "jar";

export interface Category {
  id: CategoryId;
  slug: string;
  name: string;
  blurb: string;
  /** Art direction used for category tiles. */
  tone: "dark" | "light" | "ember";
}

export interface Variant {
  id: string;
  sku: string;
  /** Pack size label, e.g. "900 g" or "1 L". */
  size: string;
  flavor?: string;
  flavorHex?: string;
  priceCents: number;
  compareAtCents?: number;
  weightGrams: number;
  /** Units available. 0 means sold out. */
  stock: number;
  servings?: number;
}

export interface NutritionRow {
  label: string;
  value: string;
  indent?: boolean;
}

export interface Nutrition {
  servingSize: string;
  rows: NutritionRow[];
  /** Always true for the demo catalog: values are illustrative, not label data. */
  illustrative: true;
}

export interface PackArt {
  kind: PackKind;
  body: "black" | "bone" | "charcoal" | "umber" | "slate";
  /** Product name split over the label lines. */
  lines: [string, string?];
  descriptor: string;
  accent: string;
  /** If true the accent colour is replaced by the selected flavour colour. */
  flavorDriven?: boolean;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  categoryId: CategoryId;
  /** Training goals this product is shown under; a product can serve several. */
  goals: GoalId[];
  tagline: string;
  description: string[];
  highlights: string[];
  variants: Variant[];
  defaultVariantId: string;
  ingredients: string;
  allergens?: string;
  nutrition: Nutrition;
  directions: string;
  warnings: string[];
  related: string[];
  pack: PackArt;
  keywords: string[];
  badges: string[];
  /** ISO date used for the "newest" sort. */
  addedAt: string;
  /** Lower is more prominent in "featured" order. */
  featuredRank: number;
  /** Lower is a better seller in the demo ranking. */
  bestSellerRank: number;
  /** Description of what a serving looks like, where it needs explaining. */
  servingNote?: string;
}

export interface CartLine {
  variantId: string;
  quantity: number;
}

export interface ResolvedLine {
  variantId: string;
  productId: string;
  productSlug: string;
  productTitle: string;
  variantLabel: string;
  sku: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
  weightGrams: number;
  maxQuantity: number;
}
