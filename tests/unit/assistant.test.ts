import { describe, expect, it } from "vitest";
import { answerLocally } from "@/server/assistant/engine";
import type { ChatMessage } from "@/server/assistant/types";
import type { DemoOrder, OrderRepository } from "@/server/orders/types";

const user = (content: string): ChatMessage => ({ role: "user", content });
const ask = (content: string, history: ChatMessage[] = [], orders?: OrderRepository) =>
  answerLocally([...history, user(content)], { orders: orders ?? emptyRepo });

const emptyRepo: OrderRepository = { create: async () => {}, get: async () => null };

function makeOrder(overrides: Partial<DemoOrder> = {}): DemoOrder {
  return {
    id: "FRG-DEMO-ABCDE12345",
    createdAt: "2026-10-21T08:00:00.000Z", // a Wednesday
    mode: "demo",
    status: "demo_created",
    paymentStatus: "not_charged_demo",
    fulfilmentStatus: "not_fulfilled",
    paymentProvider: "demo",
    customer: { email: "anna@example.com", phone: "+49 30 1234567" },
    shippingAddress: {} as DemoOrder["shippingAddress"],
    billingAddress: {} as DemoOrder["billingAddress"],
    shipping: { methodId: "standard", label: "Standard delivery", costCents: 590, etaBusinessDays: [3, 5], country: "DE", illustrative: true },
    lines: [{ quantity: 2 } as DemoOrder["lines"][number]],
    pricing: { currency: "EUR", subtotalCents: 6980, discountCode: null, discountCents: 0, shippingCents: 590, totalCents: 7570 },
    ...overrides,
  };
}

const repoWith = (order: DemoOrder): OrderRepository => ({
  create: async () => {},
  get: async (id) => (id === order.id ? order : null),
});

describe("assistant: shipping", () => {
  it("lists the supported countries in English and Turkish", async () => {
    const en = await ask("Which countries do you ship to?");
    expect(en.intent).toBe("shipping-countries");
    for (const c of ["Türkiye", "United States", "Canada", "Germany", "Austria", "United Kingdom"]) expect(en.text).toContain(c);

    const tr = await ask("Hangi ülkelere gönderim var?");
    expect(tr.language).toBe("tr");
    expect(tr.intent).toBe("shipping-countries");
    expect(tr.text).toContain("Germany");
    expect(tr.text).toContain("iş günü");
  });

  it("answers delivery time for a named country", async () => {
    const reply = await ask("How long does delivery to Germany take?");
    expect(reply.intent).toBe("delivery-time");
    expect(reply.text).toContain("Germany");
    expect(reply.text).toContain("3-5 business days");

    const tr = await ask("Almanya'ya kaç günde gelir?");
    expect(tr.language).toBe("tr");
    expect(tr.text).toContain("3-5 iş günü");
  });

  it("explains shipping cost and the free threshold", async () => {
    const reply = await ask("Is shipping free? What's the shipping cost to Canada?");
    expect(reply.text).toContain("Canada");
    expect(reply.text).toContain("free over €120.00");
  });

  it("says no to unsupported destinations", async () => {
    const reply = await ask("Do you ship to France?");
    expect(reply.text).toMatch(/don't ship there/);
    const tr = await ask("Fransa'ya kargo var mı?");
    expect(tr.text).toContain("oraya gönderim yok");
  });
});

describe("assistant: order tracking", () => {
  it("asks for the order number and email first", async () => {
    const reply = await ask("Siparişim ne zaman ulaşır?");
    expect(reply.intent).toBe("order");
    expect(reply.language).toBe("tr");
    expect(reply.text).toContain("sipariş numaranı");
  });

  it("gives a delivery window, skipping weekends, and is honest that demo orders do not ship", async () => {
    const repo = repoWith(makeOrder());
    const reply = await ask("Where is order FRG-DEMO-ABCDE12345? My email is Anna@Example.com", [], repo);
    expect(reply.intent).toBe("order");
    expect(reply.text).toContain("demo order");
    expect(reply.text).toContain("nothing is in transit");
    // Wed 21 Oct 2026 + 3 business days = Mon 26 Oct; + 5 = Wed 28 Oct.
    expect(reply.text).toContain("Monday 26 October");
    expect(reply.text).toContain("Wednesday 28 October");
    expect(reply.links[0].href).toBe("/order/FRG-DEMO-ABCDE12345");
  });

  it("collects id and email across messages", async () => {
    const repo = repoWith(makeOrder());
    const first = await ask("when will my order arrive? FRG-DEMO-ABCDE12345", [], repo);
    expect(first.text).toContain("email");
    const history: ChatMessage[] = [user("when will my order arrive? FRG-DEMO-ABCDE12345"), { role: "assistant", content: first.text }];
    const second = await ask("anna@example.com", history, repo);
    expect(second.text).toContain("Monday 26 October");
  });

  it("answers in Turkish when the conversation is Turkish", async () => {
    const repo = repoWith(makeOrder());
    const reply = await ask("Siparişim ne zaman ulaşır? FRG-DEMO-ABCDE12345 anna@example.com", [], repo);
    expect(reply.language).toBe("tr");
    expect(reply.text).toContain("demo sipariş");
    expect(reply.text).toContain("Pazartesi");
  });

  it("does not reveal whether the id or the email was wrong", async () => {
    const repo = repoWith(makeOrder());
    const wrongEmail = await ask("order FRG-DEMO-ABCDE12345 other@example.com", [], repo);
    const wrongId = await ask("order FRG-DEMO-ZZZZZ99999 anna@example.com", [], repo);
    expect(wrongEmail.text).toBe(wrongId.text);
    expect(wrongEmail.text).toContain("couldn't find");
    expect(wrongEmail.text).not.toContain("Monday");
  });
});

describe("assistant: products and goals", () => {
  it("recommends pre-workouts and creatine for performance", async () => {
    const reply = await ask("Which products are good for performance?");
    expect(reply.intent).toBe("goal");
    expect(reply.text).toContain("Pre-Workout");
    expect(reply.text).toContain("Creatine");
    expect(reply.links[0].href).toBe("/shop?goal=performance");
  });

  it("maps Turkish goal phrases", async () => {
    const kas = await ask("Kas yapmak için hangi ürünü almalıyım?");
    expect(kas.intent).toBe("goal");
    expect(kas.text).toContain("Whey");
    const kilo = await ask("Kilo almak istiyorum ne önerirsin");
    expect(kilo.links[0].href).toBe("/shop?goal=mass-gain");
    const yag = await ask("yağ yakmak için ne var");
    expect(yag.text).toContain("tek başına yağ yakmaz");
  });

  it("never claims a supplement burns fat", async () => {
    const reply = await ask("what helps fat burn?");
    expect(reply.text).toContain("No supplement burns fat by itself");
  });

  it("explains a single product, including Turkish aliases", async () => {
    const en = await ask("What is creatine?");
    expect(en.intent).toBe("product");
    expect(en.text).toContain("creatine monohydrate");
    const tr = await ask("kreatin nedir");
    expect(tr.intent).toBe("product");
    expect(tr.language).toBe("tr");
    expect(tr.text).toContain("kreatin monohidrat");
  });

  it("knows about the blueberry creatine and its stock", async () => {
    const reply = await ask("blueberry creatine price");
    expect(reply.text).toContain("€15.90");
    expect(reply.text).toContain("was €19.90");
  });

  it("reports stock honestly", async () => {
    const reply = await ask("is sour lemon pre-workout in stock?");
    expect(reply.text).toContain("Sour Lemon 450 g: only 3 left");
  });

  it("describes every product with a guide", async () => {
    const reply = await ask("which supplement is for what?");
    expect(reply.intent).toBe("guide");
    expect(reply.text).toContain("Performance");
    expect(reply.text).toContain("Health");
  });

  it("adds a medical disclaimer instead of advice", async () => {
    const reply = await ask("Can I take pre-workout if I'm pregnant?");
    expect(reply.intent).toBe("medical");
    expect(reply.text).toContain("can't give medical advice");
    expect(reply.text).toContain("Pre-Workout warnings");
  });
});

describe("assistant: other topics", () => {
  it("lists demo discount codes and the daily deal", async () => {
    const reply = await ask("any discount codes?");
    expect(reply.text).toContain("FORGE10");
    expect(reply.text).toContain("Daily deal");
  });

  it("is clear that payments are demo only", async () => {
    const reply = await ask("can I pay by credit card?");
    expect(reply.intent).toBe("payment");
    expect(reply.text).toContain("never takes payment");
  });

  it("falls back with suggestions", async () => {
    const reply = await ask("xyzzy plugh");
    expect(reply.intent).toBe("unknown");
    expect(reply.suggestions.length).toBeGreaterThan(0);
  });

  it("always reports where the answer came from", async () => {
    expect((await ask("hello")).source).toBe("rules");
  });
});
