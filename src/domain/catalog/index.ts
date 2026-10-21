import { categories, getCategory } from "./categories";
import { products } from "./products";
import type { CategoryId, Product, ResolvedLine, Variant } from "../types";

export { categories, getCategory, products };

const productById = new Map(products.map((p) => [p.id, p]));
const productBySlug = new Map(products.map((p) => [p.slug, p]));
const variantIndex = new Map<string, { product: Product; variant: Variant }>();
for (const product of products) {
  for (const variant of product.variants) {
    variantIndex.set(variant.id, { product, variant });
  }
}

export function getProductById(id: string): Product | undefined {
  return productById.get(id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return productBySlug.get(slug);
}

export function getVariant(variantId: string): { product: Product; variant: Variant } | undefined {
  return variantIndex.get(variantId);
}

export function getProductsByCategory(categoryId: CategoryId): Product[] {
  return products.filter((p) => p.categoryId === categoryId);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return product.related
    .map((id) => productById.get(id))
    .filter((p): p is Product => Boolean(p))
    .slice(0, limit);
}

export function getBestSellers(limit = 4): Product[] {
  return [...products].sort((a, b) => a.bestSellerRank - b.bestSellerRank).slice(0, limit);
}

export function getFeatured(limit = 4): Product[] {
  return [...products].sort((a, b) => a.featuredRank - b.featuredRank).slice(0, limit);
}

export function minPrice(product: Product): number {
  return Math.min(...product.variants.map((v) => v.priceCents));
}

export function maxPrice(product: Product): number {
  return Math.max(...product.variants.map((v) => v.priceCents));
}

export function isInStock(product: Product): boolean {
  return product.variants.some((v) => v.stock > 0);
}

export function variantLabel(variant: Variant): string {
  return [variant.flavor, variant.size].filter(Boolean).join(" / ");
}

export function productFlavors(product: Product): string[] {
  return [...new Set(product.variants.map((v) => v.flavor).filter((f): f is string => Boolean(f)))];
}

export function productSizes(product: Product): string[] {
  return [...new Set(product.variants.map((v) => v.size))];
}

export function defaultVariant(product: Product): Variant {
  const found = product.variants.find((v) => v.id === product.defaultVariantId && v.stock > 0);
  return found ?? product.variants.find((v) => v.stock > 0) ?? product.variants[0];
}

/** A product can be quick-added only when it has a single unambiguous in-stock variant. */
export function quickAddVariant(product: Product): Variant | undefined {
  const available = product.variants.filter((v) => v.stock > 0);
  return available.length === 1 ? available[0] : undefined;
}

/** Hard cap per cart line regardless of stock, to keep demo orders sensible. */
export const MAX_LINE_QUANTITY = 10;

export function resolveLine(variantId: string, quantity: number): ResolvedLine | undefined {
  const entry = getVariant(variantId);
  if (!entry) return undefined;
  const { product, variant } = entry;
  const maxQuantity = Math.min(variant.stock, MAX_LINE_QUANTITY);
  const qty = Math.max(0, Math.min(Math.floor(Number.isFinite(quantity) ? quantity : 0), maxQuantity));
  return {
    variantId: variant.id,
    productId: product.id,
    productSlug: product.slug,
    productTitle: product.title,
    variantLabel: variantLabel(variant),
    sku: variant.sku,
    unitPriceCents: variant.priceCents,
    quantity: qty,
    lineTotalCents: variant.priceCents * qty,
    weightGrams: variant.weightGrams * qty,
    maxQuantity,
  };
}

export const flavorHexByName: Record<string, string> = Object.fromEntries(
  products.flatMap((p) => p.variants.filter((v) => v.flavor && v.flavorHex).map((v) => [v.flavor!, v.flavorHex!])),
);
