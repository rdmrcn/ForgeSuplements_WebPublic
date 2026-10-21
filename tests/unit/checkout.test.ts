import { describe, expect, it } from "vitest";
import { checkoutFormSchema, emptyAddress, orderRequestSchema } from "@/domain/checkout";
import { priceCart } from "@/domain/pricing";
import { createDemoOrder } from "@/server/orders";

process.env.ORDER_STORE_PATH = `${process.cwd()}/.data/test-orders.json`;

const validShipping = {
  ...emptyAddress("DE"),
  firstName: "Anna",
  lastName: "Schmidt",
  address1: "Torstrasse",
  houseNumber: "12",
  postalCode: "10115",
  city: "Berlin",
};

const base = {
  email: "anna@example.com",
  phone: "+49 30 1234567",
  shipping: validShipping,
  billingSame: true,
  shippingMethodId: "standard" as const,
  acceptDemoTerms: true,
};

function issuesFor(values: unknown): string[] {
  const r = checkoutFormSchema.safeParse(values);
  return r.success ? [] : r.error.issues.map((i) => i.path.join("."));
}

describe("checkout validation", () => {
  it("accepts a valid German address", () => {
    expect(issuesFor(base)).toEqual([]);
  });

  it("rejects bad contact details", () => {
    expect(issuesFor({ ...base, email: "nope" })).toContain("email");
    expect(issuesFor({ ...base, phone: "abc" })).toContain("phone");
    expect(issuesFor({ ...base, acceptDemoTerms: false })).toContain("acceptDemoTerms");
  });

  it("applies country-specific postal and region rules", () => {
    expect(issuesFor({ ...base, shipping: { ...validShipping, postalCode: "1011" } })).toContain("shipping.postalCode");

    const us = { ...emptyAddress("US"), firstName: "A", lastName: "B", address1: "1 Main St", city: "Austin", postalCode: "78701", region: "TX" };
    expect(issuesFor({ ...base, shipping: us })).toEqual([]);
    expect(issuesFor({ ...base, shipping: { ...us, region: "" } })).toContain("shipping.region");
    expect(issuesFor({ ...base, shipping: { ...us, postalCode: "7870" } })).toContain("shipping.postalCode");
    expect(issuesFor({ ...base, shipping: { ...us, postalCode: "78701-1234" } })).toEqual([]);

    const ca = { ...emptyAddress("CA"), firstName: "A", lastName: "B", address1: "1 King St", city: "Toronto", postalCode: "m5v 2t6", region: "ON" };
    expect(issuesFor({ ...base, shipping: ca })).toEqual([]);
    expect(issuesFor({ ...base, shipping: { ...ca, postalCode: "12345" } })).toContain("shipping.postalCode");

    const gb = { ...emptyAddress("GB"), firstName: "A", lastName: "B", address1: "10 Downing Street", city: "London", postalCode: "SW1A 2AA" };
    expect(issuesFor({ ...base, shipping: gb })).toEqual([]);

    const at = { ...emptyAddress("AT"), firstName: "A", lastName: "B", address1: "Graben", houseNumber: "1", city: "Wien", postalCode: "1010" };
    expect(issuesFor({ ...base, shipping: at })).toEqual([]);
    expect(issuesFor({ ...base, shipping: { ...at, houseNumber: "" } })).toContain("shipping.houseNumber");
  });

  it("requires province and district for Türkiye and validates known districts", () => {
    const tr = { ...emptyAddress("TR"), firstName: "A", lastName: "B", address1: "Moda Cd.", houseNumber: "5", postalCode: "34710", region: "İstanbul", district: "Kadıköy" };
    expect(issuesFor({ ...base, shipping: tr })).toEqual([]);
    expect(issuesFor({ ...base, shipping: { ...tr, district: "" } })).toContain("shipping.district");
    expect(issuesFor({ ...base, shipping: { ...tr, district: "Atlantis" } })).toContain("shipping.district");
    expect(issuesFor({ ...base, shipping: { ...tr, region: "" } })).toContain("shipping.region");
    expect(issuesFor({ ...base, shipping: { ...tr, region: "Sinop", district: "Merkez" } })).toEqual([]);
  });

  it("requires a billing address when it differs", () => {
    expect(issuesFor({ ...base, billingSame: false })).toContain("billing.firstName");
    expect(issuesFor({ ...base, billingSame: false, billing: validShipping })).toEqual([]);
  });

  it("rejects an empty order request", () => {
    const r = orderRequestSchema.safeParse({ checkout: base, items: [], expectedTotalCents: 0 });
    expect(r.success).toBe(false);
  });
});

describe("demo order creation", () => {
  const items = [{ variantId: "creatine-600-g", quantity: 2 }];
  const expected = () => priceCart({ lines: items, country: "DE", shippingMethodId: "standard" }).totalCents;

  it("creates an explicitly unpaid demo order", async () => {
    const result = await createDemoOrder({ checkout: base, items, expectedTotalCents: expected() });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order.id).toMatch(/^FRG-DEMO-/);
    expect(result.order.mode).toBe("demo");
    expect(result.order.paymentStatus).toBe("not_charged_demo");
    expect(result.order.fulfilmentStatus).toBe("not_fulfilled");
    expect(result.order.pricing.totalCents).toBe(expected());
  });

  it("rejects manipulated totals", async () => {
    const result = await createDemoOrder({ checkout: base, items, expectedTotalCents: 1 });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("price_mismatch");
    expect(result.serverTotalCents).toBe(expected());
  });

  it("rejects invalid checkout data, unknown items and quantities beyond stock", async () => {
    const bad = await createDemoOrder({
      checkout: { ...base, shipping: { ...validShipping, postalCode: "x" } },
      items,
      expectedTotalCents: expected(),
    });
    expect(bad.ok).toBe(false);

    const unknown = await createDemoOrder({
      checkout: base,
      items: [{ variantId: "fake", quantity: 1 }],
      expectedTotalCents: 0,
    });
    expect(unknown.ok).toBe(false);

    const overStock = await createDemoOrder({
      checkout: base,
      items: [{ variantId: "pre-workout-sour-lemon-450-g", quantity: 8 }],
      expectedTotalCents: 8 * 3490,
    });
    expect(overStock.ok).toBe(false);
    if (!overStock.ok) expect(overStock.code).toBe("cart_changed");

    const negative = await createDemoOrder({
      checkout: base,
      items: [{ variantId: "creatine-600-g", quantity: -2 }],
      expectedTotalCents: 0,
    });
    expect(negative.ok).toBe(false);
  });

  it("rejects an invalid discount code instead of ignoring it", async () => {
    const result = await createDemoOrder({
      checkout: { ...base, discountCode: "HACK" },
      items,
      expectedTotalCents: expected(),
    });
    expect(result.ok).toBe(false);
  });
});
