import { expect, test } from "@playwright/test";
import { trackConsole } from "./helpers";

async function noHorizontalOverflow(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

test("mobile homepage, menu and layouts do not overflow", async ({ page }) => {
  const errors = trackConsole(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await noHorizontalOverflow(page);

  await page.getByRole("button", { name: "Open menu" }).click();
  const menu = page.getByRole("dialog", { name: "Menu" });
  await expect(menu.getByRole("link", { name: "Protein" })).toBeVisible();
  await menu.getByRole("link", { name: "Protein" }).click();
  await expect(page).toHaveURL(/\/shop\/protein/);
  await noHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test("mobile shopping flow: filters, product, cart drawer, checkout", async ({ page }) => {
  await page.goto("/shop");
  await page.getByTestId("goal-performance").click();
  await expect(page.getByTestId("product-card")).toHaveCount(7);
  await page.getByRole("button", { name: /Filters/ }).click();
  const filters = page.getByRole("dialog", { name: "Filters" });
  await filters.getByLabel("Blueberry").check();
  await filters.getByRole("button", { name: /Show 1/ }).click();
  await expect(page.getByTestId("product-card")).toHaveCount(1);
  await noHorizontalOverflow(page);

  await page.getByTestId("product-card").getByRole("link", { name: /Creatine Monohydrate Blueberry/ }).first().click();
  await expect(page.getByTestId("product-title")).toBeVisible();
  await noHorizontalOverflow(page);
  await page.getByTestId("add-to-cart").first().click();

  await page.getByTestId("cart-button").click();
  const drawer = page.getByRole("dialog", { name: "Shopping cart" });
  await expect(drawer.getByTestId("cart-line")).toHaveCount(1);
  await drawer.getByTestId("drawer-checkout").click();
  await expect(page.getByTestId("checkout-form")).toBeVisible();
  await noHorizontalOverflow(page);
});
