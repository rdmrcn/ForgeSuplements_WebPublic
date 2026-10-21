import { expect, test } from "@playwright/test";
import { addToCartFromPdp, parseMoney, trackConsole } from "./helpers";

const slugs = [
  "standard-whey-protein",
  "whey-protein-isolate",
  "creatine-monohydrate",
  "pre-workout",
  "bcaa",
  "eaa",
  "mass-gainer",
  "casein-protein",
  "liquid-l-carnitine",
  "caffeine-tablets",
  "omega-3",
  "multivitamin",
  "l-carnitine-tablets",
];

test.describe("browsing", () => {
  test("homepage renders with its core sections", async ({ page }) => {
    const errors = trackConsole(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/built\s*for the\s*work/i);
    await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Pick your lane/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Start here/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /The short list/i })).toBeVisible();
    await expect(page.getByRole("form", { name: "Newsletter signup" })).toBeVisible();
    expect(errors).toEqual([]);
  });

  for (const slug of slugs) {
    test(`product page loads: ${slug}`, async ({ page }) => {
      const errors = trackConsole(page);
      const res = await page.goto(`/products/${slug}`);
      expect(res?.status()).toBe(200);
      await expect(page.getByTestId("product-title")).toBeVisible();
      await expect(page.getByTestId("product-price")).toContainText("€");
      await expect(page.getByRole("img", { name: /packaging render/ }).first()).toBeVisible();
      await expect(page.getByRole("heading", { name: "Pairs well with" })).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  test("search and filters work together and reset", async ({ page }) => {
    await page.goto("/search?q=cocoa");
    await expect(page.getByTestId("result-count")).toContainText("3 products");

    await page.getByRole("complementary", { name: "Filters" }).getByLabel("Protein").check();
    await expect(page.getByTestId("result-count")).toContainText("3 products");
    await page.getByRole("complementary", { name: "Filters" }).getByLabel("500 g").check();
    await expect(page.getByTestId("result-count")).toContainText("1 product");
    await expect(page.getByTestId("product-card")).toHaveCount(1);
    await expect(page.getByTestId("active-filters")).toContainText("500 g");

    await page.getByTestId("reset-filters").click();
    await expect(page.getByTestId("result-count")).toContainText("3 products");
    await expect(page).toHaveURL(/q=cocoa/);
  });

  test("category page shows only its products and sorts by price", async ({ page }) => {
    await page.goto("/shop/amino-acids");
    await expect(page.getByTestId("product-card")).toHaveCount(2);
    await page.goto("/shop?sort=price-desc");
    const first = page.getByTestId("product-card").first();
    await expect(first).toContainText("Whey Protein Isolate");
    await page.goto("/shop?sort=price-asc");
    await expect(page.getByTestId("product-card").first()).toContainText("Caffeine Tablets");
  });

  test("empty search shows a graceful fallback", async ({ page }) => {
    await page.goto("/search?q=zzzxqj");
    await expect(page.getByTestId("empty-results")).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse all products" })).toBeVisible();
    await page.getByRole("button", { name: "Clear search and filters" }).click();
    await expect(page.getByTestId("product-card").first()).toBeVisible();
  });

  test("search overlay suggests products", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Search products" }).click();
    await page.getByRole("searchbox", { name: "Search products" }).fill("raspberry");
    await expect(page.getByRole("link", { name: /Pre-Workout/ }).first()).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/search\?q=raspberry/);
  });

  test("unknown product shows the custom 404", async ({ page }) => {
    const res = await page.goto("/products/does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /Off the plate/i })).toBeVisible();
  });
});

test.describe("cart", () => {
  test("variant selection updates price and keeps variants as separate lines", async ({ page }) => {
    await page.goto("/products/creatine-monohydrate");
    await expect(page.getByTestId("product-price")).toHaveText("€19.90");
    await page.getByRole("radiogroup", { name: "Size" }).getByText("600 g", { exact: true }).click();
    await expect(page.getByTestId("product-price")).toHaveText("€34.90");
    await page.getByTestId("add-to-cart").first().click();
    await page.getByRole("radiogroup", { name: "Size" }).getByText("300 g", { exact: true }).click();
    await page.getByTestId("add-to-cart").first().click();
    await page.getByTestId("add-to-cart").first().click();

    await page.getByTestId("cart-button").click();
    const lines = page.getByRole("dialog", { name: "Shopping cart" }).getByTestId("cart-line");
    await expect(lines).toHaveCount(2);
    await expect(lines.filter({ hasText: "300 g" })).toContainText("€39.80");
    await expect(lines.filter({ hasText: "600 g" })).toContainText("€34.90");
    await expect(page.getByTestId("cart-count")).toHaveText("3");
  });

  test("quantities, totals, persistence and discount codes", async ({ page }) => {
    await addToCartFromPdp(page, "creatine-monohydrate", { size: "600 g" });
    await page.goto("/cart");
    const main = page.getByRole("main");
    await expect(main.getByTestId("cart-line")).toHaveCount(1);

    await main.getByRole("button", { name: /Increase quantity/ }).click();
    await expect(main.getByTestId("subtotal")).toHaveText("€69.80");

    await page.reload();
    await expect(main.getByTestId("cart-line")).toHaveCount(1);
    await expect(main.getByTestId("subtotal")).toHaveText("€69.80");

    await main.getByPlaceholder("Discount code").fill("NOPE");
    await main.getByRole("button", { name: "Apply" }).click();
    await expect(main.getByRole("alert").filter({ hasText: "not valid" })).toBeVisible();

    await main.getByPlaceholder("Discount code").fill("forge10");
    await main.getByRole("button", { name: "Apply" }).click();
    await expect(main.getByTestId("discount-applied")).toContainText("FORGE10");
    await expect(main.getByTestId("discount")).toHaveText("-€6.98");

    const sub = await parseMoney(await main.getByTestId("subtotal").textContent());
    const disc = await parseMoney((await main.getByTestId("discount").textContent())?.replace("-", ""));
    const ship = await main.getByTestId("shipping").textContent();
    const shipCents = ship === "Free" ? 0 : await parseMoney(ship);
    const total = await parseMoney(await main.getByTestId("total").textContent());
    expect(total).toBe(sub - disc + shipCents);

    const decrease = main.getByRole("button", { name: /Decrease quantity/ });
    await decrease.click();
    await expect(decrease).toBeDisabled();
    await main.getByRole("button", { name: /Remove .* from cart/ }).click();
    await expect(main.getByTestId("cart-empty")).toBeVisible();
  });

  test("stock limits cap quantities", async ({ page }) => {
    await addToCartFromPdp(page, "pre-workout", { flavor: "Sour Lemon" });
    await page.goto("/cart");
    const main = page.getByRole("main");
    const increase = main.getByRole("button", { name: /Increase quantity/ });
    await increase.click();
    await increase.click();
    await expect(increase).toBeDisabled();
    await expect(main.getByText("Maximum available quantity reached.")).toBeVisible();
  });

  test("sold-out variants cannot be added", async ({ page }) => {
    await page.goto("/products/eaa");
    await page.getByRole("radio", { name: /Orange Zest/ }).check({ force: true });
    await expect(page.getByTestId("stock-status")).toContainText("Sold out");
    await expect(page.getByTestId("add-to-cart").first()).toBeDisabled();
  });

  test("shipping estimate changes with the destination", async ({ page }) => {
    await addToCartFromPdp(page, "creatine-monohydrate");
    await page.goto("/cart");
    const main = page.getByRole("main");
    const select = main.getByLabel("Ship to");
    await select.selectOption("DE");
    const de = await main.getByTestId("shipping").textContent();
    await select.selectOption("US");
    await expect(main.getByTestId("shipping")).not.toHaveText(de ?? "");
    const us = await main.getByTestId("shipping").textContent();
    await select.selectOption("TR");
    await expect(main.getByTestId("shipping")).not.toHaveText(us ?? "");
    const tr = await main.getByTestId("shipping").textContent();
    expect(new Set([de, us, tr]).size).toBe(3);
    expect(await parseMoney(us)).toBeGreaterThan(await parseMoney(de));
  });

  test("favourites persist", async ({ page }) => {
    await page.goto("/products/omega-3");
    await page.getByRole("button", { name: /Save Omega-3/ }).click();
    await page.goto("/favorites");
    await expect(page.getByTestId("product-card")).toHaveCount(1);
    await page.reload();
    await expect(page.getByTestId("product-card")).toHaveCount(1);
  });
});
