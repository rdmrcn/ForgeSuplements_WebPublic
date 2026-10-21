import { expect, type Page } from "@playwright/test";

export function trackConsole(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text()}`);
  });
  return errors;
}

export async function addToCartFromPdp(page: Page, slug: string, opts: { flavor?: string; size?: string } = {}) {
  await page.goto(`/products/${slug}`);
  if (opts.flavor) await page.getByRole("radio", { name: new RegExp(opts.flavor) }).check({ force: true });
  if (opts.size) await page.getByRole("radiogroup", { name: "Size" }).getByText(opts.size, { exact: true }).click();
  await page.getByTestId("add-to-cart").first().click();
  await expect(page.getByRole("status").filter({ hasText: "added to your cart" })).toBeVisible();
}

export async function parseMoney(text: string | null | undefined): Promise<number> {
  const m = (text ?? "").replace(/[^0-9.,-]/g, "").replace(",", "");
  return Math.round(parseFloat(m) * 100);
}
