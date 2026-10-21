import { describe, expect, it } from "vitest";
import { categories, getProductBySlug, getVariant, products, quickAddVariant } from "@/domain/catalog";

describe("catalog data", () => {
  it("has unique product ids, slugs, variant ids and SKUs", () => {
    const ids = new Set(products.map((p) => p.id));
    const slugs = new Set(products.map((p) => p.slug));
    const variantIds = products.flatMap((p) => p.variants.map((v) => v.id));
    const skus = products.flatMap((p) => p.variants.map((v) => v.sku));
    expect(ids.size).toBe(products.length);
    expect(slugs.size).toBe(products.length);
    expect(new Set(variantIds).size).toBe(variantIds.length);
    expect(new Set(skus).size).toBe(skus.length);
  });

  it("gives every product valid, complete data", () => {
    for (const product of products) {
      expect(categories.some((c) => c.id === product.categoryId), product.id).toBe(true);
      expect(product.variants.length, product.id).toBeGreaterThan(0);
      expect(product.variants.some((v) => v.id === product.defaultVariantId), `${product.id} default`).toBe(true);
      expect(product.description.length).toBeGreaterThan(0);
      expect(product.ingredients.length).toBeGreaterThan(10);
      expect(product.directions.length).toBeGreaterThan(10);
      expect(product.warnings.length).toBeGreaterThan(0);
      expect(product.nutrition.rows.length).toBeGreaterThan(0);
      expect(product.nutrition.illustrative).toBe(true);
      expect(product.related.length).toBeGreaterThan(0);
      for (const related of product.related) {
        expect(products.some((p) => p.id === related), `${product.id} -> ${related}`).toBe(true);
        expect(related).not.toBe(product.id);
      }
      for (const v of product.variants) {
        expect(Number.isInteger(v.priceCents) && v.priceCents > 0, v.id).toBe(true);
        expect(v.weightGrams, v.id).toBeGreaterThan(0);
        expect(Number.isInteger(v.stock) && v.stock >= 0, v.id).toBe(true);
        if (v.compareAtCents) expect(v.compareAtCents).toBeGreaterThan(v.priceCents);
        if (v.flavor) expect(v.flavorHex, v.id).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });

  it("contains every required product and variant", () => {
    const sizes = (slug: string) => getProductBySlug(slug)!.variants.map((v) => v.size);
    expect(getProductBySlug("standard-whey-protein")).toBeDefined();
    expect(getProductBySlug("whey-protein-isolate")).toBeDefined();
    expect(new Set(sizes("creatine-monohydrate"))).toEqual(new Set(["300 g", "600 g"]));
    expect(new Set(getProductBySlug("pre-workout")!.variants.map((v) => v.flavor))).toEqual(
      new Set(["Raspberry", "Sour Lemon", "Watermelon Punch"]),
    );
    expect(sizes("pre-workout")).toEqual(["450 g", "450 g", "450 g"]);
    expect(new Set(sizes("mass-gainer"))).toEqual(new Set(["1.5 kg", "3 kg", "6 kg"]));
    expect(sizes("casein-protein")).toContain("500 g");
    expect(sizes("liquid-l-carnitine")).toContain("1 L");
    for (const slug of ["bcaa", "eaa", "caffeine-tablets", "omega-3", "multivitamin", "l-carnitine-tablets"]) {
      expect(getProductBySlug(slug), slug).toBeDefined();
    }
  });

  it("keeps whey and isolate clearly distinct", () => {
    const whey = getProductBySlug("standard-whey-protein")!;
    const isolate = getProductBySlug("whey-protein-isolate")!;
    expect(whey.pack.body).not.toBe(isolate.pack.body);
    expect(whey.ingredients).not.toBe(isolate.ingredients);
    expect(whey.id).not.toBe(isolate.id);
  });

  it("varies price, weight and availability between mass gainer sizes", () => {
    const mg = getProductBySlug("mass-gainer")!;
    const choc = mg.variants.filter((v) => v.flavor === "Chocolate Brownie");
    expect(new Set(choc.map((v) => v.priceCents)).size).toBe(3);
    expect(new Set(choc.map((v) => v.weightGrams)).size).toBe(3);
    expect(mg.variants.some((v) => v.stock === 0)).toBe(true);
  });

  it("looks variants up by id and only quick-adds unambiguous products", () => {
    expect(getVariant("creatine-600-g")?.product.id).toBe("creatine");
    expect(getVariant("does-not-exist")).toBeUndefined();
    expect(quickAddVariant(getProductBySlug("creatine-monohydrate")!)).toBeUndefined();
  });
});
