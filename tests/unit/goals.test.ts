import { describe, expect, it } from "vitest";
import { getVariant, goals, products } from "@/domain/catalog";
import { dailyDeal } from "@/config/deals";
import { defaultFilters, filterProducts, parseFilters, serializeFilters } from "@/domain/search";

const ids = (list: { id: string }[]) => list.map((p) => p.id);
const byGoal = (goal: (typeof goals)[number]["id"]) =>
  ids(filterProducts(products, { ...defaultFilters, goals: [goal] }));

describe("shopping goals", () => {
  it("gives every product a goal and every goal a product", () => {
    for (const p of products) expect(p.goals.length, p.id).toBeGreaterThan(0);
    for (const g of goals) expect(byGoal(g.id).length, g.id).toBeGreaterThan(0);
  });

  it("puts pre-workouts and creatine under performance", () => {
    expect(byGoal("performance")).toEqual(expect.arrayContaining(["pre-workout", "creatine", "creatine-blueberry"]));
    expect(byGoal("performance")).not.toContain("omega-3");
  });

  it("maps the other goals sensibly", () => {
    expect(byGoal("mass-gain")).toContain("mass-gainer");
    expect(byGoal("fat-burn")).toEqual(expect.arrayContaining(["liquid-carnitine", "carnitine-tablets"]));
    expect(byGoal("health").sort()).toEqual(["multivitamin", "omega-3"]);
    expect(byGoal("muscle-gain")).toEqual(expect.arrayContaining(["whey", "isolate", "casein"]));
  });

  it("combines a goal with a product type", () => {
    const list = filterProducts(products, { ...defaultFilters, goals: ["performance"], categories: ["pre-workout"] });
    expect(ids(list)).toEqual(["pre-workout"]);
  });

  it("round-trips through the URL and ignores unknown goals", () => {
    const filters = { ...defaultFilters, goals: ["fat-burn" as const] };
    const params = serializeFilters(filters);
    expect(params.get("goal")).toBe("fat-burn");
    expect(parseFilters(params).goals).toEqual(["fat-burn"]);
    expect(parseFilters(new URLSearchParams("goal=bogus")).goals).toEqual([]);
  });
});

describe("daily deal", () => {
  it("is the new 300 g blueberry creatine at a real discount", () => {
    const found = getVariant(dailyDeal.variantId);
    expect(found?.product.categoryId).toBe("creatine");
    expect(found?.variant.size).toBe("300 g");
    expect(found?.variant.flavor).toBe("Blueberry");
    expect(found!.variant.priceCents).toBeLessThan(found!.variant.compareAtCents!);
    expect(found!.variant.stock).toBeGreaterThan(0);
  });
});
