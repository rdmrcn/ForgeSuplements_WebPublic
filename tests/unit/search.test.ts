import { describe, expect, it } from "vitest";
import { products } from "@/domain/catalog";
import { defaultFilters, filterProducts, parseFilters, serializeFilters } from "@/domain/search";

const ids = (list: { id: string }[]) => list.map((p) => p.id);

describe("search and filters", () => {
  it("finds products by title, keyword and flavour", () => {
    expect(ids(filterProducts(products, { ...defaultFilters, q: "isolate" }))).toContain("isolate");
    expect(ids(filterProducts(products, { ...defaultFilters, q: "watermelon" }))).toEqual(["pre-workout"]);
    expect(ids(filterProducts(products, { ...defaultFilters, q: "l carnitine" }))).toEqual(
      expect.arrayContaining(["liquid-carnitine", "carnitine-tablets"]),
    );
  });

  it("returns an empty list for nonsense queries", () => {
    expect(filterProducts(products, { ...defaultFilters, q: "zzzxqj" })).toEqual([]);
  });

  it("combines search with category, flavour, size and price filters", () => {
    const protein = filterProducts(products, { ...defaultFilters, q: "cocoa", categories: ["protein"] });
    expect(ids(protein).sort()).toEqual(["casein", "isolate", "whey"]);

    const sized = filterProducts(products, { ...defaultFilters, q: "cocoa", sizes: ["500 g"] });
    expect(ids(sized)).toEqual(["casein"]);

    const flavor = filterProducts(products, { ...defaultFilters, flavors: ["Raspberry"] });
    expect(ids(flavor)).toEqual(["pre-workout"]);

    const cheap = filterProducts(products, { ...defaultFilters, maxCents: 1500 });
    expect(cheap.every((p) => p.variants.some((v) => v.priceCents <= 1500))).toBe(true);
    expect(ids(cheap)).toEqual(expect.arrayContaining(["caffeine", "multivitamin"]));
  });

  it("applies filters at variant level", () => {
    const r = filterProducts(products, { ...defaultFilters, flavors: ["Vanilla Cream"], inStockOnly: true, sizes: ["6 kg"] });
    expect(r).toEqual([]);
  });

  it("sorts by price and newest", () => {
    const asc = filterProducts(products, { ...defaultFilters, sort: "price-asc" });
    const prices = asc.map((p) => Math.min(...p.variants.map((v) => v.priceCents)));
    expect([...prices].sort((a, b) => a - b)).toEqual(prices);
    const desc = filterProducts(products, { ...defaultFilters, sort: "price-desc" });
    const dprices = desc.map((p) => Math.min(...p.variants.map((v) => v.priceCents)));
    expect([...dprices].sort((a, b) => b - a)).toEqual(dprices);
    const newest = filterProducts(products, { ...defaultFilters, sort: "newest" });
    expect(newest[0].addedAt >= newest[newest.length - 1].addedAt).toBe(true);
  });

  it("round-trips filters through URL params", () => {
    const filters = { ...defaultFilters, q: "whey", categories: ["protein" as const], flavors: ["Dark Cocoa"], minCents: 1000, maxCents: 6000, sort: "price-asc" as const };
    const parsed = parseFilters(serializeFilters(filters));
    expect(parsed).toEqual(filters);
  });
});
