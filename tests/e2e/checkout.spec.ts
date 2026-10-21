import { expect, test, type Page } from "@playwright/test";
import { addToCartFromPdp } from "./helpers";

async function startCheckout(page: Page) {
  await addToCartFromPdp(page, "creatine-monohydrate", { size: "600 g" });
  await page.goto("/checkout");
  await expect(page.getByTestId("checkout-form")).toBeVisible();
  return page.getByTestId("checkout-form");
}

async function fillGerman(form: ReturnType<Page["getByTestId"]>) {
  await form.getByLabel("Email address").fill("anna@example.com");
  await form.getByLabel("Phone number").fill("+49 30 1234567");
  await form.getByLabel("First name").fill("Anna");
  await form.getByLabel("Last name").fill("Schmidt");
  await form.getByLabel("Country or region").selectOption("DE");
  await form.getByLabel("Street", { exact: true }).fill("Torstrasse");
  await form.getByLabel("House number").fill("12");
  await form.getByLabel("Postal code (PLZ)").fill("10115");
  await form.getByLabel("City", { exact: true }).fill("Berlin");
}

test.describe("checkout", () => {
  test("address fields follow the selected country", async ({ page }) => {
    const form = await startCheckout(page);
    const country = form.getByLabel("Country or region");

    await country.selectOption("TR");
    await expect(form.getByLabel("Province (İl)")).toBeVisible();
    await expect(form.getByLabel("District (İlçe)")).toBeDisabled();
    await form.getByLabel("Province (İl)").selectOption("İstanbul");
    await expect(form.getByLabel("District (İlçe)")).toBeEnabled();
    await expect(form.getByLabel("District (İlçe)").locator("option", { hasText: "Kadıköy" })).toHaveCount(1);
    await form.getByLabel("Province (İl)").selectOption("Sinop");
    await expect(form.getByLabel("District (İlçe)")).toHaveJSProperty("tagName", "INPUT");
    await expect(form.getByLabel("Building number")).toBeVisible();

    await country.selectOption("US");
    await expect(form.getByLabel("State")).toBeVisible();
    await expect(form.getByLabel("ZIP code")).toBeVisible();
    await expect(form.getByLabel("Province (İl)")).toHaveCount(0);

    await country.selectOption("CA");
    await expect(form.getByLabel("Province or territory")).toBeVisible();
    await expect(form.getByLabel("Postal code", { exact: true })).toBeVisible();

    await country.selectOption("DE");
    await expect(form.getByLabel("House number")).toBeVisible();
    await expect(form.getByLabel("Postal code (PLZ)")).toBeVisible();

    await country.selectOption("AT");
    await expect(form.getByLabel("Stiege, floor, door (Top)")).toBeVisible();

    await country.selectOption("GB");
    await expect(form.getByLabel("Postcode")).toBeVisible();
    await expect(form.getByLabel("Address line 1")).toBeVisible();
  });

  test("order summary shipping recalculates when the country changes", async ({ page }) => {
    const form = await startCheckout(page);
    const totals = page.getByRole("complementary", { name: "Order summary" });
    await form.getByLabel("Country or region").selectOption("DE");
    const de = await totals.getByTestId("shipping").textContent();
    await form.getByLabel("Country or region").selectOption("US");
    await expect(totals.getByTestId("shipping")).not.toHaveText(de ?? "");
  });

  test("invalid data is rejected with field-level messages", async ({ page }) => {
    const form = await startCheckout(page);
    await form.getByTestId("continue").click();
    await expect(form.getByText("Enter your email address.")).toBeVisible();
    await expect(form.getByText("Enter a first name.")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Where should it go/ })).toBeVisible();

    await fillGerman(form);
    await form.getByLabel("Postal code (PLZ)").fill("1011");
    await form.getByTestId("continue").click();
    await expect(form.getByText(/Enter a valid Germany postal code/)).toBeVisible();
    await expect(form.getByLabel("Email address")).toHaveValue("anna@example.com");
  });

  test("demo checkout creates an explicitly unpaid order", async ({ page }) => {
    const form = await startCheckout(page);
    await fillGerman(form);
    await form.getByTestId("continue").click();

    await expect(page.getByRole("heading", { name: /How should it travel/ })).toBeVisible();
    const totals = page.getByRole("complementary", { name: "Order summary" });
    const standardTotal = await totals.getByTestId("total").textContent();
    await form.getByText("Express delivery").click();
    await expect(totals.getByTestId("total")).not.toHaveText(standardTotal ?? "");
    await form.getByTestId("continue").click();

    await expect(page.getByTestId("payment-demo")).toContainText("No card number");
    await page.getByTestId("place-order").click();
    await expect(page.getByText("Please confirm you understand this is a demo order.")).toBeVisible();
    await form.getByLabel(/I understand this is a demo order/).check();
    await page.getByTestId("place-order").click();

    await expect(page).toHaveURL(/\/order\/FRG-DEMO-[A-Z0-9]{10}$/);
    await expect(page.getByTestId("demo-order-banner")).toContainText("Demo order created");
    await expect(page.getByTestId("payment-status")).toContainText("unpaid (demo)");
    await expect(page.getByText("Torstrasse 12")).toBeVisible();

    await page.goto("/cart");
    await expect(page.getByRole("main").getByTestId("cart-empty")).toBeVisible();
  });

  test("server rejects manipulated totals and invalid payloads", async ({ request }) => {
    const address = {
      firstName: "Anna", lastName: "Schmidt", country: "DE", address1: "Torstrasse", houseNumber: "12",
      address2: "", district: "", city: "Berlin", region: "", postalCode: "10115", deliveryNotes: "",
    };
    const checkout = {
      email: "anna@example.com", phone: "+49 30 1234567", shipping: address, billingSame: true,
      shippingMethodId: "standard", acceptDemoTerms: true,
    };
    const items = [{ variantId: "creatine-600-g", quantity: 1 }];

    const tampered = await request.post("/api/orders", { data: { checkout, items, expectedTotalCents: 100 } });
    expect(tampered.status()).toBe(409);
    expect((await tampered.json()).code).toBe("price_mismatch");

    const badAddress = await request.post("/api/orders", {
      data: { checkout: { ...checkout, shipping: { ...address, postalCode: "abc" } }, items, expectedTotalCents: 4080 },
    });
    expect(badAddress.status()).toBe(400);
    expect((await badAddress.json()).fieldErrors["shipping.postalCode"]).toBeTruthy();

    const negative = await request.post("/api/orders", {
      data: { checkout, items: [{ variantId: "creatine-600-g", quantity: -1 }], expectedTotalCents: 0 },
    });
    expect(negative.status()).toBe(400);

    const missing = await request.get("/order/FRG-DEMO-AAAAAAAAAA");
    expect(await missing.text()).toContain("Off the plate");
  });
});
