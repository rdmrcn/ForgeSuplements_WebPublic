import { expect, test } from "@playwright/test";
import { trackConsole } from "./helpers";

async function openHelpDesk(page: import("@playwright/test").Page) {
  await page.getByTestId("helpdesk-launcher").click();
  await expect(page.getByTestId("helpdesk-panel")).toBeVisible();
  await expect(page.getByTestId("helpdesk-input")).toBeFocused();
}

async function ask(page: import("@playwright/test").Page, text: string) {
  const before = await page.getByTestId("helpdesk-message").count();
  await page.getByTestId("helpdesk-input").fill(text);
  await page.getByTestId("helpdesk-send").click();
  await expect(page.getByTestId("helpdesk-message")).toHaveCount(before + 1);
  return page.getByTestId("helpdesk-message").last();
}

test.describe("help desk assistant", () => {
  test("opens, answers shipping questions and closes with Escape", async ({ page }) => {
    const errors = trackConsole(page);
    await page.goto("/");
    await openHelpDesk(page);

    const reply = await ask(page, "Which countries do you ship to?");
    for (const country of ["Türkiye", "United States", "Canada", "Germany", "Austria", "United Kingdom"]) {
      await expect(reply).toContainText(country);
    }
    await expect(page.getByTestId("helpdesk-panel")).toContainText("Answered from store data");

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("helpdesk-panel")).toHaveCount(0);
    await expect(page.getByTestId("helpdesk-launcher")).toBeFocused();
    expect(errors).toEqual([]);
  });

  test("answers in Turkish and recommends products for a goal", async ({ page }) => {
    await page.goto("/");
    await openHelpDesk(page);
    const reply = await ask(page, "performansta hangi ürünler var");
    await expect(reply).toContainText("Pre-Workout");
    await expect(reply).toContainText("Creatine");
    await expect(page.getByRole("link", { name: /ürünlerini gör/ })).toHaveAttribute("href", "/shop?goal=performance");
    await expect(page.getByTestId("helpdesk-panel")).toContainText("Mağaza verisinden yanıtlandı");
  });

  test("suggested questions work and the fat-burn answer stays honest", async ({ page }) => {
    await page.goto("/");
    await openHelpDesk(page);
    await page.getByTestId("helpdesk-suggestion").filter({ hasText: "How long does delivery take?" }).click();
    await expect(page.getByTestId("helpdesk-message").last()).toContainText("business days");
    const fat = await ask(page, "what helps with fat burn?");
    await expect(fat).toContainText("No supplement burns fat by itself");
  });

  test("tracks a demo order with order number and email, and rejects a wrong email", async ({ page, request }) => {
    const address = {
      firstName: "Anna", lastName: "Schmidt", country: "DE", address1: "Torstrasse", houseNumber: "12",
      address2: "", district: "", city: "Berlin", region: "", postalCode: "10115", deliveryNotes: "",
    };
    const created = await request.post("/api/orders", {
      data: {
        checkout: { email: "helpdesk@example.com", phone: "+49 30 1234567", shipping: address, billingSame: true, shippingMethodId: "standard", acceptDemoTerms: true },
        items: [{ variantId: "creatine-600-g", quantity: 1 }],
        expectedTotalCents: 4080,
      },
    });
    expect(created.status()).toBe(201);
    const { id } = await created.json();

    await page.goto("/contact");
    await page.getByRole("button", { name: "Ask the help desk" }).first().click();
    await expect(page.getByTestId("helpdesk-panel")).toBeVisible();
    await page.getByTestId("helpdesk-panel").getByTestId("helpdesk-suggestion").first().waitFor();

    await page.getByTestId("helpdesk-track").click();
    const form = page.getByTestId("helpdesk-track-form");
    await form.getByLabel("Order number").fill(id);
    await form.getByLabel("Checkout email").fill("wrong@example.com");
    await form.getByRole("button", { name: "Check delivery" }).click();
    await expect(page.getByTestId("helpdesk-message").last()).toContainText("couldn't find a demo order");

    await page.getByTestId("helpdesk-track").click();
    await form.getByLabel("Order number").fill(id);
    await form.getByLabel("Checkout email").fill("Helpdesk@Example.com");
    await form.getByRole("button", { name: "Check delivery" }).click();
    const reply = page.getByTestId("helpdesk-message").last();
    await expect(reply).toContainText(id);
    await expect(reply).toContainText("demo order");
    await expect(reply).toContainText("nothing is in transit");
    await expect(reply).toContainText("Standard delivery (3-5 business days) would arrive between");
  });

  test("the order page offers to ask about delivery for that order", async ({ page, request }) => {
    const address = {
      firstName: "Anna", lastName: "Schmidt", country: "DE", address1: "Torstrasse", houseNumber: "12",
      address2: "", district: "", city: "Berlin", region: "", postalCode: "10115", deliveryNotes: "",
    };
    const created = await request.post("/api/orders", {
      data: {
        checkout: { email: "page@example.com", phone: "+49 30 1234567", shipping: address, billingSame: true, shippingMethodId: "standard", acceptDemoTerms: true },
        items: [{ variantId: "creatine-600-g", quantity: 1 }],
        expectedTotalCents: 4080,
      },
    });
    const { id } = await created.json();
    await page.goto(`/order/${id}`);
    await page.getByRole("button", { name: "Ask about delivery" }).click();
    await expect(page.getByTestId("helpdesk-user-message").first()).toContainText(id);
    await expect(page.getByTestId("helpdesk-message").last()).toContainText("email");
  });

  test("the API validates input", async ({ request }) => {
    const empty = await request.post("/api/assistant", { data: { messages: [] } });
    expect(empty.status()).toBe(400);
    const long = await request.post("/api/assistant", { data: { messages: [{ role: "user", content: "x".repeat(601) }] } });
    expect(long.status()).toBe(400);
    const endsWithAssistant = await request.post("/api/assistant", { data: { messages: [{ role: "assistant", content: "hi" }] } });
    expect(endsWithAssistant.status()).toBe(400);
    const ok = await request.post("/api/assistant", { data: { messages: [{ role: "user", content: "hello" }] } });
    expect(ok.status()).toBe(200);
    expect((await ok.json()).reply.source).toBe("rules");
  });
});
