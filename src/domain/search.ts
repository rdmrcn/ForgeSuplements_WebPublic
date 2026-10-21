import { categoryName } from "./catalog/categories";
import type { CategoryId, Product, Variant } from "./types";

export type SortKey = "featured" | "price-asc" | "price-desc" | "newest";

export interface BrowseFilters {
  q: string;
  categories: CategoryId[];
  flavors: string[];
  sizes: string[];
  minCents?: number;
  maxCents?: number;
  inStockOnly: boolean;
  sort: SortKey;
}

export const defaultFilters: BrowseFilters = {
  q: "",
  categories: [],
  flavors: [],
  sizes: [],
  inStockOnly: false,
  sort: "featured",
};

export const sortLabels: Record<SortKey, string> = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  newest: "Newest",
};

function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function tokenize(query: string): string[] {
  return normalize(query).split(" ").filter(Boolean);
}

function searchFields(product: Product): { text: string; weight: number }[] {
  const flavors = product.variants.map((v) => v.flavor).filter(Boolean).join(" ");
  const sizes = product.variants.map((v) => v.size).join(" ");
  return [
    { text: normalize(product.title), weight: 10 },
    { text: normalize(product.keywords.join(" ")), weight: 6 },
    { text: normalize(categoryName(product.categoryId)), weight: 4 },
    { text: normalize(flavors), weight: 4 },
    { text: normalize(sizes), weight: 2 },
    { text: normalize(product.tagline), weight: 2 },
    { text: normalize(product.description.join(" ")), weight: 1 },
  ];
}

/** Returns a relevance score, or 0 when any query token has no match. */
export function searchScore(product: Product, query: string): number {
  const tokens = tokenize(query);
  if (tokens.length === 0) return 1;
  const fields = searchFields(product);
  let total = 0;
  for (const token of tokens) {
    let best = 0;
    for (const field of fields) {
      const words = field.text.split(" ");
      const hit = words.some((w) => w === token)
        ? field.weight * 2
        : words.some((w) => w.startsWith(token))
          ? field.weight
          : token.length >= 3 && field.text.includes(token)
            ? field.weight / 2
            : 0;
      best = Math.max(best, hit);
    }
    if (best === 0) return 0;
    total += best;
  }
  return total;
}

export function variantMatches(variant: Variant, filters: BrowseFilters): boolean {
  if (filters.flavors.length > 0 && !(variant.flavor && filters.flavors.includes(variant.flavor))) return false;
  if (filters.sizes.length > 0 && !filters.sizes.includes(variant.size)) return false;
  if (filters.minCents !== undefined && variant.priceCents < filters.minCents) return false;
  if (filters.maxCents !== undefined && variant.priceCents > filters.maxCents) return false;
  if (filters.inStockOnly && variant.stock <= 0) return false;
  return true;
}

export function filterProducts(products: Product[], filters: BrowseFilters): Product[] {
  const scored = products
    .map((product) => ({ product, score: searchScore(product, filters.q) }))
    .filter(({ product, score }) => {
      if (score === 0) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(product.categoryId)) return false;
      return product.variants.some((v) => variantMatches(v, filters));
    });

  const priceOf = (p: Product) =>
    Math.min(...p.variants.filter((v) => variantMatches(v, filters)).map((v) => v.priceCents));

  scored.sort((a, b) => {
    switch (filters.sort) {
      case "price-asc":
        return priceOf(a.product) - priceOf(b.product) || a.product.featuredRank - b.product.featuredRank;
      case "price-desc":
        return priceOf(b.product) - priceOf(a.product) || a.product.featuredRank - b.product.featuredRank;
      case "newest":
        return b.product.addedAt.localeCompare(a.product.addedAt) || a.product.featuredRank - b.product.featuredRank;
      default:
        if (filters.q.trim() && a.score !== b.score) return b.score - a.score;
        return a.product.featuredRank - b.product.featuredRank;
    }
  });
  return scored.map((s) => s.product);
}

export function suggestProducts(products: Product[], query: string, limit = 5): Product[] {
  return filterProducts(products, { ...defaultFilters, q: query }).slice(0, limit);
}

const SORT_KEYS: SortKey[] = ["featured", "price-asc", "price-desc", "newest"];

function list(params: URLSearchParams, key: string): string[] {
  return params
    .getAll(key)
    .flatMap((v) => v.split("|"))
    .map((v) => v.trim())
    .filter(Boolean);
}

function cents(value: string | null): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : undefined;
}

export function parseFilters(params: URLSearchParams, lockedCategory?: CategoryId): BrowseFilters {
  const sort = params.get("sort") as SortKey | null;
  return {
    q: (params.get("q") ?? "").slice(0, 80),
    categories: lockedCategory ? [lockedCategory] : (list(params, "category") as CategoryId[]),
    flavors: list(params, "flavor"),
    sizes: list(params, "size"),
    minCents: cents(params.get("min")),
    maxCents: cents(params.get("max")),
    inStockOnly: params.get("stock") === "in",
    sort: sort && SORT_KEYS.includes(sort) ? sort : "featured",
  };
}

export function serializeFilters(filters: BrowseFilters, lockedCategory?: CategoryId): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (!lockedCategory && filters.categories.length) params.set("category", filters.categories.join("|"));
  if (filters.flavors.length) params.set("flavor", filters.flavors.join("|"));
  if (filters.sizes.length) params.set("size", filters.sizes.join("|"));
  if (filters.minCents !== undefined) params.set("min", String(filters.minCents / 100));
  if (filters.maxCents !== undefined) params.set("max", String(filters.maxCents / 100));
  if (filters.inStockOnly) params.set("stock", "in");
  if (filters.sort !== "featured") params.set("sort", filters.sort);
  return params;
}

export function countActiveFilters(filters: BrowseFilters, lockedCategory?: CategoryId): number {
  return (
    (lockedCategory ? 0 : filters.categories.length) +
    filters.flavors.length +
    filters.sizes.length +
    (filters.minCents !== undefined ? 1 : 0) +
    (filters.maxCents !== undefined ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0)
  );
}
