import { describe, expect, it } from "vitest";
import { priceCart } from "@/domain/pricing";
import { shippingCountries } from "@/config/shipping";

const line = (variantId: string, quantity: number) => ({ variantId, quantity });

describe("priceCart", () => {
  it("prices from catalog data and sums lines", () => {
    const r = priceCart({ lines: [line("creatine-300-g", 2), line("creatine-600-g", 1)], country: "DE" });
    expect(r.subtotalCents).toBe(1990 * 2 + 3490);
    expect(r.lines).toHaveLength(2);
    expect(r.itemCount).toBe(3);
  });

  it("keeps different variants of one product as separate lines", () => {
    const r = priceCart({ lines: [line("whey-dark-cocoa-900-g", 1), line("whey-vanilla-bean-900-g", 1)] });
    expect(r.lines.map((l) => l.variantId)).toEqual(["whey-dark-cocoa-900-g", "whey-vanilla-bean-900-g"]);
  });

  it("merges duplicate lines for the same variant", () => {
    const r = priceCart({ lines: [line("creatine-300-g", 1), line("creatine-300-g", 2)] });
    expect(r.lines).toHaveLength(1);
    expect(r.lines[0].quantity).toBe(3);
  });

  it("ignores negative, zero, fractional and non-finite quantities", () => {
    const r = priceCart({
      lines: [line("creatine-300-g", -3), line("creatine-600-g", 0), line("omega-3-90-softgels", NaN), line("caffeine-100-tablets", 2.9)],
    });
    expect(r.lines.map((l) => [l.variantId, l.quantity])).toEqual([["caffeine-100-tablets", 2]]);
    expect(r.subtotalCents).toBe(990 * 2);
  });

  it("caps quantities at stock and removes sold-out or unknown items", () => {
    const capped = priceCart({ lines: [line("pre-workout-sour-lemon-450-g", 9)] });
    expect(capped.lines[0].quantity).toBe(3);
    expect(capped.adjustments.length).toBe(1);

    const soldOut = priceCart({ lines: [line("eaa-orange-zest-400-g", 1), line("nope", 1)] });
    expect(soldOut.lines).toHaveLength(0);
    expect(soldOut.adjustments.length).toBe(2);
    expect(soldOut.totalCents).toBe(0);
  });

  it("limits a line to the global maximum", () => {
    const r = priceCart({ lines: [line("caffeine-100-tablets", 500)] });
    expect(r.lines[0].quantity).toBe(10);
  });

  it("applies discount codes and rejects invalid ones", () => {
    const ok = priceCart({ lines: [line("creatine-600-g", 2)], discountCode: " forge10 " });
    expect(ok.discount.status).toBe("applied");
    expect(ok.discountCents).toBe(Math.round(3490 * 2 * 0.1));

    const bad = priceCart({ lines: [line("creatine-600-g", 2)], discountCode: "NOTACODE" });
    expect(bad.discount.status).toBe("invalid");
    expect(bad.discountCents).toBe(0);

    const tooSmall = priceCart({ lines: [line("caffeine-100-tablets", 1)], discountCode: "FORGE10" });
    expect(tooSmall.discount.status).toBe("invalid");
  });

  it("never lets totals go negative", () => {
    const r = priceCart({ lines: [], discountCode: "WELCOME5" });
    expect(r.totalCents).toBe(0);
    expect(r.shippingCents).toBe(0);
  });
});

describe("shipping", () => {
  const cart = [line("whey-dark-cocoa-900-g", 1)];

  it("changes with the destination country", () => {
    const costs = (Object.keys(shippingCountries) as (keyof typeof shippingCountries)[]).map(
      (country) => priceCart({ lines: cart, country, shippingMethodId: "standard" }).shippingCents,
    );
    expect(new Set(costs).size).toBeGreaterThan(3);
    expect(priceCart({ lines: cart, country: "US" }).shippingCents).toBeGreaterThan(
      priceCart({ lines: cart, country: "DE" }).shippingCents,
    );
  });

  it("offers express as a more expensive option", () => {
    const r = priceCart({ lines: cart, country: "GB" });
    const standard = r.quotes.find((q) => q.methodId === "standard")!;
    const express = r.quotes.find((q) => q.methodId === "express")!;
    expect(express.costCents).toBeGreaterThan(standard.costCents);
    expect(priceCart({ lines: cart, country: "GB", shippingMethodId: "express" }).shippingCents).toBe(express.costCents);
  });

  it("is free above the threshold and responds to the subtotal", () => {
    const small = priceCart({ lines: cart, country: "DE" });
    expect(small.shipping?.free).toBe(false);
    const big = priceCart({ lines: [line("whey-dark-cocoa-2-kg", 2)], country: "DE" });
    expect(big.shipping?.free).toBe(true);
    expect(big.shippingCents).toBe(0);
  });

  it("charges more for heavier parcels", () => {
    const light = priceCart({ lines: [line("creatine-300-g", 1)], country: "US" });
    const heavy = priceCart({ lines: [line("mass-gainer-chocolate-brownie-1-5-kg", 2)], country: "US" });
    expect(heavy.weightGrams).toBeGreaterThan(light.weightGrams);
    expect(heavy.shippingCents).toBeGreaterThan(light.shippingCents);
  });

  it("supports a free-shipping code on standard only", () => {
    const r = priceCart({ lines: cart, country: "US", discountCode: "FREESHIP" });
    expect(r.shippingCents).toBe(0);
    const express = priceCart({ lines: cart, country: "US", discountCode: "FREESHIP", shippingMethodId: "express" });
    expect(express.shippingCents).toBeGreaterThan(0);
  });

  it("includes shipping in the total", () => {
    const r = priceCart({ lines: cart, country: "CA" });
    expect(r.totalCents).toBe(r.subtotalCents - r.discountCents + r.shippingCents);
  });
});
