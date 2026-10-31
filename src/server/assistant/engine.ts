import { brand } from "@/config/brand";
import { dailyDeal } from "@/config/deals";
import { discounts } from "@/config/discounts";
import { countryList, shippingCountries, type CountryCode } from "@/config/shipping";
import { getGoal, getProductById, getProductsByGoal, getVariant, goals, minPrice, maxPrice, products } from "@/domain/catalog";
import { deliveryWindow, formatWindow } from "@/domain/delivery";
import type { GoalId, Product } from "@/domain/types";
import { formatMoney } from "@/lib/format";
import { getOrderRepository, type OrderRepository } from "@/server/orders";
import {
  countryAliases,
  goalKeywords,
  medicalKeywords,
  productFamilies,
  productGuides,
  unsupportedDestinations,
} from "./knowledge";
import { detectLanguage, extractOrderCredentials, fold, has, hasWord, EMAIL_PATTERN, ORDER_ID_PATTERN } from "./text";
import type { AssistantLink, AssistantReply, ChatMessage, Intent, Lang } from "./types";

const pick = (lang: Lang, en: string, tr: string) => (lang === "tr" ? tr : en);
const locale = (lang: Lang) => (lang === "tr" ? "tr-TR" : "en-GB");

function etaText([min, max]: [number, number], lang: Lang): string {
  const range = min === max ? `${min}` : `${min}-${max}`;
  return pick(lang, `${range} business days`, `${range} iş günü`);
}

const L = (label: string, href: string): AssistantLink => ({ label, href });

interface Draft {
  text: string;
  links?: AssistantLink[];
  suggestions?: string[];
  intent: Intent;
}

function suggestionsFor(lang: Lang, key: "start" | "shipping" | "product" | "order"): string[] {
  const sets = {
    start: {
      en: ["Which countries do you ship to?", "Which supplement is for muscle gain?", "How long does delivery take?", "Track my order"],
      tr: ["Hangi ülkelere gönderim var?", "Kas yapmak için hangi ürün?", "Teslimat kaç gün sürer?", "Siparişim ne zaman ulaşır?"],
    },
    shipping: {
      en: ["How long to Germany?", "Is shipping free?", "Track my order"],
      tr: ["Almanya'ya kaç günde gelir?", "Kargo ücretsiz mi?", "Siparişim ne zaman ulaşır?"],
    },
    product: {
      en: ["What products help with performance?", "Any discount codes?", "Which countries do you ship to?"],
      tr: ["Performans için hangi ürünler var?", "İndirim kodu var mı?", "Hangi ülkelere gönderim var?"],
    },
    order: {
      en: ["How long does shipping take?", "Which countries do you ship to?"],
      tr: ["Teslimat kaç gün sürer?", "Hangi ülkelere gönderim var?"],
    },
  };
  return sets[key][lang];
}

function detectCountry(text: string): CountryCode | undefined {
  for (const code of Object.keys(countryAliases) as CountryCode[]) {
    const alias = countryAliases[code];
    if (has(text, alias.prefixes) || (alias.words && hasWord(text, alias.words))) return code;
  }
  return undefined;
}

function detectGoals(text: string): GoalId[] {
  return (Object.keys(goalKeywords) as GoalId[]).filter((id) => {
    const k = goalKeywords[id];
    return has(text, k.prefixes) || (k.words ? hasWord(text, k.words) : false);
  });
}

function matchProducts(text: string): Product[] {
  const specific = products.filter((p) => {
    const guide = productGuides[p.id];
    return guide ? has(text, guide.terms) : false;
  });
  if (specific.length > 0) {
    const ids = new Set(specific.map((p) => p.id));
    if (ids.has("creatine-blueberry") && ids.has("creatine")) ids.delete("creatine");
    // Naming a carnitine format picks that format only.
    return specific.filter((p) => ids.has(p.id));
  }
  const family = productFamilies.find((f) => has(text, f.terms));
  return family ? family.ids.map((id) => getProductById(id)).filter((p): p is Product => Boolean(p)) : [];
}

function stockNotes(product: Product, lang: Lang): string[] {
  const notes: string[] = [];
  for (const v of product.variants) {
    const label = [v.flavor, v.size].filter(Boolean).join(" ");
    if (v.stock <= 0) notes.push(pick(lang, `${label}: sold out`, `${label}: tükendi`));
    else if (v.stock <= 5) notes.push(pick(lang, `${label}: only ${v.stock} left`, `${label}: son ${v.stock} adet`));
  }
  return notes;
}

function priceText(product: Product): string {
  const lo = minPrice(product);
  const hi = maxPrice(product);
  return lo === hi ? formatMoney(lo) : `${formatMoney(lo)} - ${formatMoney(hi)}`;
}

function productLink(p: Product): AssistantLink {
  return L(p.title, `/products/${p.slug}`);
}

function productOverview(p: Product, lang: Lang): string {
  const guide = productGuides[p.id];
  const flavors = [...new Set(p.variants.map((v) => v.flavor).filter(Boolean))];
  const sizes = [...new Set(p.variants.map((v) => v.size))];
  const lines = [
    guide
      ? pick(lang, `${p.title} is ${guide.what.en}. ${guide.typical.en}`, `${p.title}: ${guide.what.tr}. ${guide.typical.tr}`)
      : p.tagline,
    pick(lang, `Price: ${priceText(p)} (demo prices). Sizes: ${sizes.join(", ")}.`, `Fiyat: ${priceText(p)} (demo fiyatları). Boyutlar: ${sizes.join(", ")}.`),
  ];
  if (flavors.length) lines.push(pick(lang, `Flavours: ${flavors.join(", ")}.`, `Aromalar: ${flavors.join(", ")}.`));
  const notes = stockNotes(p, lang);
  if (notes.length) lines.push(pick(lang, `Stock: ${notes.join("; ")}.`, `Stok: ${notes.join("; ")}.`));
  lines.push(
    pick(
      lang,
      "Ask me about ingredients, how to use it, or warnings. Nutrition values in this demo are illustrative.",
      "İçindekiler, kullanım şekli ya da uyarılar hakkında sorabilirsin. Bu demodaki besin değerleri gösterim amaçlıdır.",
    ),
  );
  return lines.join("\n");
}

// ---- handlers -------------------------------------------------------------------------------

function greeting(lang: Lang): Draft {
  return {
    intent: "greeting",
    text: pick(
      lang,
      `Hi, I'm the ${brand.name} help desk assistant. I can check when an order would arrive, tell you which countries we ship to, and explain what each supplement is commonly used for. What would you like to know?`,
      `Merhaba, ben ${brand.name} yardım masası asistanıyım. Siparişinin ne zaman ulaşacağına bakabilir, hangi ülkelere gönderim yaptığımızı söyleyebilir ve her takviyenin genelde ne için kullanıldığını anlatabilirim. Ne öğrenmek istersin?`,
    ),
    suggestions: suggestionsFor(lang, "start"),
  };
}

function countriesList(lang: Lang): Draft {
  const lines = countryList.map((c) => {
    const std = c.methods.find((m) => m.id === "standard")!;
    return `- ${c.name}: ${etaText(std.etaBusinessDays, lang)}, ${pick(lang, "from", "başlangıç")} ${formatMoney(std.baseCents)}`;
  });
  return {
    intent: "shipping-countries",
    text: [
      pick(lang, `This demo store ships to ${countryList.length} countries (standard delivery shown, illustrative rates):`, `Bu demo mağaza ${countryList.length} ülkeye gönderim yapıyor (standart teslimat, gösterim amaçlı ücretler):`),
      ...lines,
      pick(lang, "Express is also available everywhere. Customs, duties and VAT are not calculated. Ask about a country for details.", "Her yerde ekspres teslimat da var. Gümrük, vergi ve KDV hesaplanmaz. Ayrıntı için bir ülkeyi sor."),
    ].join("\n"),
    links: [L(pick(lang, "Shipping policy", "Kargo politikası"), "/policies/shipping")],
    suggestions: suggestionsFor(lang, "shipping"),
  };
}

function countryDetail(code: CountryCode, lang: Lang): Draft {
  const c = shippingCountries[code];
  const lines = c.methods.map((m) => {
    const free = m.freeOverCents ? pick(lang, `, free over ${formatMoney(m.freeOverCents)}`, `, ${formatMoney(m.freeOverCents)} üzeri ücretsiz`) : "";
    return `- ${m.label}: ${pick(lang, "from", "başlangıç")} ${formatMoney(m.baseCents)}, ${etaText(m.etaBusinessDays, lang)}${free}`;
  });
  return {
    intent: "shipping-country",
    text: [
      pick(lang, `Yes, we ship to ${c.name} (illustrative demo rates):`, `Evet, ${c.name} için gönderim var (gösterim amaçlı demo ücretleri):`),
      ...lines,
      pick(lang, "Rates rise with parcel weight. Estimates count business days and exclude public holidays.", "Ücret paket ağırlığıyla artar. Süreler iş günüdür, resmi tatiller hariçtir."),
      c.notices[c.notices.length - 1],
    ].join("\n"),
    links: [L(pick(lang, "Shipping policy", "Kargo politikası"), "/policies/shipping")],
    suggestions: suggestionsFor(lang, "shipping"),
  };
}

function unsupportedDestination(lang: Lang): Draft {
  const names = countryList.map((c) => c.name).join(", ");
  return {
    intent: "shipping-countries",
    text: pick(
      lang,
      `We don't ship there in this demo. Supported destinations: ${names}.`,
      `Bu demoda oraya gönderim yok. Desteklenen ülkeler: ${names}.`,
    ),
    suggestions: suggestionsFor(lang, "shipping"),
  };
}

function deliveryTime(code: CountryCode | undefined, lang: Lang): Draft {
  if (code) return { ...countryDetail(code, lang), intent: "delivery-time" };
  const lines = countryList.map((c) => {
    const [std, exp] = [c.methods.find((m) => m.id === "standard")!, c.methods.find((m) => m.id === "express")!];
    return `- ${c.name}: ${pick(lang, "standard", "standart")} ${etaText(std.etaBusinessDays, lang)}, ${pick(lang, "express", "ekspres")} ${etaText(exp.etaBusinessDays, lang)}`;
  });
  return {
    intent: "delivery-time",
    text: [pick(lang, "Estimated delivery times by country (business days, illustrative):", "Ülkeye göre tahmini teslimat süreleri (iş günü, gösterim amaçlı):"), ...lines].join("\n"),
    links: [L(pick(lang, "Shipping policy", "Kargo politikası"), "/policies/shipping")],
    suggestions: suggestionsFor(lang, "order"),
  };
}

function shippingCost(code: CountryCode | undefined, lang: Lang): Draft {
  if (code) return { ...countryDetail(code, lang), intent: "shipping-cost" };
  const lines = countryList.map((c) => {
    const std = c.methods.find((m) => m.id === "standard")!;
    return `- ${c.name}: ${formatMoney(std.baseCents)}${std.freeOverCents ? pick(lang, `, free over ${formatMoney(std.freeOverCents)}`, `, ${formatMoney(std.freeOverCents)} üzeri ücretsiz`) : ""}`;
  });
  return {
    intent: "shipping-cost",
    text: [
      pick(lang, "Standard shipping starts at (free above the threshold, illustrative):", "Standart kargo başlangıç ücretleri (eşiğin üzerinde ücretsiz, gösterim amaçlı):"),
      ...lines,
      pick(lang, "The code FREESHIP also makes standard shipping free in the demo checkout.", "FREESHIP kodu demo ödemede standart kargoyu da ücretsiz yapar."),
    ].join("\n"),
    suggestions: suggestionsFor(lang, "shipping"),
  };
}

function goalAnswer(ids: GoalId[], lang: Lang): Draft {
  const sections = ids.slice(0, 2).map((id) => {
    const goal = getGoal(id)!;
    const items = getProductsByGoal(id).slice(0, 8);
    const lines = items.map((p) => {
      const guide = productGuides[p.id];
      return `- ${p.title} (${pick(lang, "from", "başlangıç")} ${formatMoney(minPrice(p))})${guide ? `: ${guide.what[lang]}` : ""}`;
    });
    const note = pick(
      lang,
      goal.note ?? "",
      {
        "muscle-gain": "Takviyeler antrenman planını ve dengeli beslenmeyi destekler; tek başına kas yapmaz.",
        "mass-gain": "Kilo almak, harcadığından fazla enerji almaya bağlıdır; bu ürünler kalori eklemeyi kolaylaştırır.",
        "fat-burn": "Hiçbir takviye tek başına yağ yakmaz. Bu ürünler kalori kontrollü beslenme ve düzenli antrenmanla birlikte düşünülür.",
        performance: "",
        health: "Gıda takviyeleri çeşitli ve dengeli beslenmenin yerini tutmaz.",
      }[id],
    );
    return [pick(lang, `${goal.name}:`, `${{ "muscle-gain": "Kas kazanımı", "mass-gain": "Kütle ve kilo alma", "fat-burn": "Yağ yakımı", performance: "Performans", health: "Sağlık" }[id]}:`), ...lines, note].filter(Boolean).join("\n");
  });
  return {
    intent: "goal",
    text: sections.join("\n\n"),
    links: ids.slice(0, 2).map((id) => L(pick(lang, `Shop ${getGoal(id)!.name}`, `${getGoal(id)!.name} ürünlerini gör`), `/shop?goal=${id}`)),
    suggestions: suggestionsFor(lang, "product"),
  };
}

function guideAnswer(lang: Lang): Draft {
  const lines = goals.map((g) => {
    const names = getProductsByGoal(g.id).map((p) => p.shortTitle).join(", ");
    const label = pick(lang, g.name, { "muscle-gain": "Kas kazanımı", "mass-gain": "Kütle ve kilo alma", "fat-burn": "Yağ yakımı", performance: "Performans", health: "Sağlık" }[g.id]);
    return `- ${label}: ${names}`;
  });
  return {
    intent: "guide",
    text: [
      pick(lang, "Here is how the range groups by goal. A product can fit more than one goal.", "Ürün yelpazesi hedeflere göre böyle gruplanıyor. Bir ürün birden fazla hedefe uyabilir."),
      ...lines,
      pick(lang, "Ask about any product, for example creatine or pre-workout, and I'll explain what it is and how people commonly use it.", "Kreatin ya da pre-workout gibi herhangi bir ürünü sor, ne olduğunu ve genelde nasıl kullanıldığını anlatayım."),
    ].join("\n"),
    links: [L(pick(lang, "Shop by goal", "Hedefe göre alışveriş"), "/shop")],
    suggestions: suggestionsFor(lang, "product"),
  };
}

function productAnswer(list: Product[], text: string, lang: Lang): Draft {
  if (list.length > 1) {
    const lines = list.map((p) => {
      const guide = productGuides[p.id];
      return `- ${p.title} (${priceText(p)})${guide ? `: ${guide.what[lang]}` : ""}`;
    });
    return {
      intent: "products",
      text: [pick(lang, "These products match:", "Bunlar eşleşiyor:"), ...lines, pick(lang, "Ask about one of them for details.", "Ayrıntı için birini sor.")].join("\n"),
      links: list.map(productLink),
      suggestions: suggestionsFor(lang, "product"),
    };
  }
  const p = list[0];
  const askPrice = has(text, ["price", "fiyat", "how much", "kac para", "kac tl", "ne kadar", "cost", "ucret"]);
  const askStock = has(text, ["stock", "stok", "available", "mevcut", "var mi", "sold out", "tukendi"]);
  const askFlavor = has(text, ["flavor", "flavour", "aroma", "taste", "tat", "cesit"]);
  const askIngredients = has(text, ["ingredient", "icerik", "allergen", "alerj", "vegan"]);
  const askDirections = has(text, ["how to use", "how do i", "how should", "directions", "nasil kullan", "nasil al", "nasil icil", "when to take", "ne zaman al", "dose", "doz", "kac kasik", "scoop"]);
  const note = lang === "tr" ? "\n(Ürün metni İngilizce.)" : "";
  const links = [productLink(p), ...p.related.slice(0, 2).map((id) => getProductById(id)).filter((x): x is Product => Boolean(x)).map(productLink)];

  let body: string;
  if (askIngredients) {
    body = pick(lang, `Ingredients of ${p.title}: ${p.ingredients}`, `${p.title} içindekiler: ${p.ingredients}`) + (p.allergens ? `\n${pick(lang, "Allergens", "Alerjenler")}: ${p.allergens}` : "") + note;
  } else if (askDirections) {
    body = pick(lang, `Directions for ${p.title}: ${p.directions}`, `${p.title} kullanım şekli: ${p.directions}`) + `\n${pick(lang, "Warnings", "Uyarılar")}: ${p.warnings.slice(0, 2).join(" ")}` + note;
  } else if (askStock) {
    const notes = stockNotes(p, lang);
    body = notes.length
      ? pick(lang, `${p.title} stock notes: ${notes.join("; ")}. Everything else is in stock.`, `${p.title} stok durumu: ${notes.join("; ")}. Diğer seçenekler stokta.`)
      : pick(lang, `${p.title} is in stock in every size and flavour.`, `${p.title} tüm boyut ve aromalarda stokta.`);
  } else if (askFlavor) {
    const flavors = [...new Set(p.variants.map((v) => v.flavor).filter(Boolean))];
    body = flavors.length
      ? pick(lang, `${p.title} comes in: ${flavors.join(", ")}.`, `${p.title} aromaları: ${flavors.join(", ")}.`)
      : pick(lang, `${p.title} is unflavoured.`, `${p.title} aromasızdır.`);
  } else if (askPrice) {
    const lines = p.variants.map((v) => `- ${[v.flavor, v.size].filter(Boolean).join(" ")}: ${formatMoney(v.priceCents)}${v.compareAtCents ? ` (${pick(lang, "was", "önceki")} ${formatMoney(v.compareAtCents)})` : ""}`);
    body = [pick(lang, `${p.title} prices (demo):`, `${p.title} fiyatları (demo):`), ...lines].join("\n");
  } else {
    body = productOverview(p, lang);
  }
  return { intent: "product", text: body, links, suggestions: suggestionsFor(lang, "product") };
}

function discountAnswer(lang: Lang): Draft {
  const lines = discounts.map((d) => {
    const rule =
      d.rule.type === "percent"
        ? pick(lang, `${d.rule.percent}% off`, `%${d.rule.percent} indirim`)
        : d.rule.type === "fixed"
          ? pick(lang, `${formatMoney(d.rule.amountCents)} off`, `${formatMoney(d.rule.amountCents)} indirim`)
          : pick(lang, "free standard shipping", "ücretsiz standart kargo");
    const min = d.minSubtotalCents ? pick(lang, `, minimum ${formatMoney(d.minSubtotalCents)}`, `, minimum ${formatMoney(d.minSubtotalCents)}`) : "";
    return `- ${d.code}: ${rule}${min}`;
  });
  const deal = getVariant(dailyDeal.variantId);
  const dealLine = deal
    ? pick(
        lang,
        `Daily deal: ${deal.product.title}, ${deal.variant.size}, ${formatMoney(deal.variant.priceCents)} instead of ${formatMoney(deal.variant.compareAtCents ?? deal.variant.priceCents)}.`,
        `Günün fırsatı: ${deal.product.title}, ${deal.variant.size}, ${formatMoney(deal.variant.compareAtCents ?? deal.variant.priceCents)} yerine ${formatMoney(deal.variant.priceCents)}.`,
      )
    : "";
  return {
    intent: "discount",
    text: [pick(lang, "Demo discount codes:", "Demo indirim kodları:"), ...lines, dealLine].filter(Boolean).join("\n"),
    links: deal ? [productLink(deal.product)] : [],
    suggestions: suggestionsFor(lang, "product"),
  };
}

function paymentAnswer(lang: Lang): Draft {
  return {
    intent: "payment",
    text: pick(
      lang,
      "This is a demo store. Checkout never takes payment and never asks for card details, so nothing is charged and nothing ships. Please don't type real card numbers anywhere on this site.",
      "Bu bir demo mağaza. Ödeme adımı hiçbir zaman ödeme almaz ve kart bilgisi istemez; yani hiçbir ücret çekilmez ve hiçbir şey gönderilmez. Lütfen bu sitede gerçek kart numarası yazma.",
    ),
    suggestions: suggestionsFor(lang, "start"),
  };
}

function returnsAnswer(lang: Lang): Draft {
  return {
    intent: "returns",
    text: pick(
      lang,
      "Because demo orders are never paid or shipped, there is nothing to return or refund. The returns policy page explains what a live policy would cover, such as return windows, opened consumables and statutory consumer rights.",
      "Demo siparişler ödenmediği ve gönderilmediği için iade ya da geri ödeme yok. İade politikası sayfası, canlı bir politikanın neleri kapsayacağını (iade süresi, açılmış ürünler, yasal tüketici hakları) açıklar.",
    ),
    links: [L(pick(lang, "Returns policy", "İade politikası"), "/policies/returns")],
    suggestions: suggestionsFor(lang, "start"),
  };
}

function humanAnswer(lang: Lang): Draft {
  return {
    intent: "human",
    text: pick(
      lang,
      `There is no live person behind this demo store. A real store would route you to ${brand.contact.email} (an example address) during ${brand.contact.hours}. The contact page shows the full support layout.`,
      `Bu demo mağazanın arkasında gerçek bir kişi yok. Gerçek bir mağaza seni ${brand.contact.hours} saatlerinde ${brand.contact.email} (örnek adres) adresine yönlendirirdi. İletişim sayfasında destek düzeninin tamamı var.`,
    ),
    links: [L(pick(lang, "Contact page", "İletişim sayfası"), "/contact")],
    suggestions: suggestionsFor(lang, "start"),
  };
}

function medicalAnswer(list: Product[], lang: Lang): Draft {
  const p = list.length === 1 ? list[0] : undefined;
  const parts = [
    pick(
      lang,
      "I can't give medical advice. If you are pregnant or breast-feeding, under 18, taking medication, or have a medical condition or allergy, please speak to a doctor or pharmacist before using any supplement. Food supplements don't replace a varied, balanced diet.",
      "Tıbbi tavsiye veremem. Hamileysen, emziriyorsan, 18 yaşından küçüksen, ilaç kullanıyorsan ya da bir hastalığın ya da alerjin varsa, herhangi bir takviyeyi kullanmadan önce doktoruna veya eczacına danış. Gıda takviyeleri çeşitli ve dengeli beslenmenin yerini tutmaz.",
    ),
  ];
  if (p) {
    parts.push(pick(lang, `${p.title} warnings: ${p.warnings.join(" ")}`, `${p.title} uyarıları: ${p.warnings.join(" ")}`));
    if (p.allergens) parts.push(`${pick(lang, "Allergens", "Alerjenler")}: ${p.allergens}`);
    if (lang === "tr") parts.push("(Ürün metni İngilizce.)");
  }
  return { intent: "medical", text: parts.join("\n"), links: p ? [productLink(p)] : [], suggestions: suggestionsFor(lang, "start") };
}

function fallback(lang: Lang): Draft {
  return {
    intent: "unknown",
    text: pick(
      lang,
      "I'm not sure I understood. I can help with order delivery estimates, shipping countries and costs, what each supplement is commonly used for, discount codes and payments in this demo. Try one of the questions below.",
      "Tam anlayamadım. Sipariş teslimat tahmini, gönderim yapılan ülkeler ve ücretler, her takviyenin genelde ne için kullanıldığı, indirim kodları ve bu demodaki ödeme konularında yardımcı olabilirim. Aşağıdaki sorulardan birini dene.",
    ),
    suggestions: suggestionsFor(lang, "start"),
  };
}

async function orderAnswer(messages: ChatMessage[], lang: Lang, orders: OrderRepository): Promise<Draft> {
  const { orderId, email } = extractOrderCredentials(messages);
  const ask = (): Draft => ({
    intent: "order",
    text: pick(
      lang,
      "I can check your delivery estimate. Please send your order number (it looks like FRG-DEMO-ABC123XYZ0 and is on the order confirmation page) and the email address you used at checkout.",
      "Teslimat tahminini kontrol edebilirim. Lütfen sipariş numaranı (FRG-DEMO-ABC123XYZ0 gibi görünür, sipariş onay sayfasında yazar) ve ödemede kullandığın e-posta adresini gönder.",
    ),
    suggestions: suggestionsFor(lang, "order"),
  });
  if (!orderId && !email) return ask();
  if (!orderId) {
    return { intent: "order", text: pick(lang, "Thanks. I also need the order number (FRG-DEMO-...).", "Teşekkürler. Sipariş numarasına da (FRG-DEMO-...) ihtiyacım var."), suggestions: [] };
  }
  if (!email) {
    return { intent: "order", text: pick(lang, "Thanks. I also need the email address used at checkout, to confirm it's your order.", "Teşekkürler. Siparişin sana ait olduğunu doğrulamak için ödemede kullandığın e-posta adresine de ihtiyacım var."), suggestions: [] };
  }

  const order = await orders.get(orderId);
  if (!order || order.customer.email.toLowerCase() !== email) {
    return {
      intent: "order",
      text: pick(
        lang,
        "I couldn't find a demo order with that number and email. Check both against your confirmation page. Demo orders are only stored on the server that created them.",
        "Bu numara ve e-posta ile bir demo sipariş bulamadım. İkisini de onay sayfanla karşılaştır. Demo siparişler yalnızca oluşturuldukları sunucuda saklanır.",
      ),
      suggestions: suggestionsFor(lang, "order"),
    };
  }

  const placed = new Date(order.createdAt);
  const window = deliveryWindow(placed, order.shipping.etaBusinessDays);
  const country = shippingCountries[order.shipping.country];
  const other = country.methods.find((m) => m.id !== order.shipping.methodId);
  const itemCount = order.lines.reduce((n, l) => n + l.quantity, 0);
  const lines = [
    pick(lang, `Order ${order.id}, placed ${new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "UTC" }).format(placed)}: ${itemCount} item${itemCount === 1 ? "" : "s"}, total ${formatMoney(order.pricing.totalCents)}, ${order.shipping.label} to ${country.name}.`,
      `Sipariş ${order.id}, ${new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeZone: "UTC" }).format(placed)} tarihinde verildi: ${itemCount} ürün, toplam ${formatMoney(order.pricing.totalCents)}, ${country.name} için ${order.shipping.label}.`),
    pick(lang, "Status: this is a demo order. Payment was not charged and nothing was fulfilled, so no parcel exists and nothing is in transit.", "Durum: bu bir demo sipariş. Ödeme alınmadı ve hiçbir şey hazırlanmadı; yani ortada bir paket yok ve yolda bir şey yok."),
    pick(
      lang,
      `If it were a live order, ${order.shipping.label} (${etaText(order.shipping.etaBusinessDays, lang)}) would arrive between ${formatWindow(window, locale(lang))}. That counts business days from the order date and excludes public holidays.`,
      `Canlı bir sipariş olsaydı ${order.shipping.label} (${etaText(order.shipping.etaBusinessDays, lang)}) ${formatWindow(window, locale(lang))} arasında ulaşırdı. Bu süre sipariş tarihinden itibaren iş günü sayar, resmi tatilleri içermez.`,
    ),
  ];
  if (other) {
    const w = deliveryWindow(placed, other.etaBusinessDays);
    lines.push(pick(lang, `${other.label} would have been ${etaText(other.etaBusinessDays, lang)}: ${formatWindow(w, locale(lang))}.`, `${other.label} ${etaText(other.etaBusinessDays, lang)} sürerdi: ${formatWindow(w, locale(lang))}.`));
  }
  return { intent: "order", text: lines.join("\n"), links: [L(pick(lang, "View order page", "Sipariş sayfasını aç"), `/order/${order.id}`)], suggestions: suggestionsFor(lang, "order") };
}

// ---- routing --------------------------------------------------------------------------------

export interface EngineDeps {
  orders?: OrderRepository;
}

export async function answerLocally(messages: ChatMessage[], deps: EngineDeps = {}): Promise<AssistantReply> {
  const lang = detectLanguage(messages);
  const latest = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const text = fold(latest);
  const orders = deps.orders ?? getOrderRepository();

  const draft = await route(messages, latest, text, lang, orders);
  return {
    text: draft.text,
    links: draft.links ?? [],
    suggestions: draft.suggestions ?? [],
    intent: draft.intent,
    language: lang,
    source: "rules",
  };
}

async function route(messages: ChatMessage[], latest: string, text: string, lang: Lang, orders: OrderRepository): Promise<Draft> {
  const hasId = ORDER_ID_PATTERN.test(latest);
  const hasEmail = EMAIL_PATTERN.test(latest);
  const orderish = has(text, ["order", "siparis", "package", "paket", "parcel", "kargom", "tracking", "takip"]);
  const statusish = has(text, ["where", "nerede", "status", "durum", "when", "ne zaman", "track", "takip", "arrive", "ulas", "deliver", "teslim", "kac gun", "how long", "nasil"]);

  if (hasId || hasEmail || (orderish && statusish) || has(text, ["siparisim", "my order", "kargom nerede"])) {
    return orderAnswer(messages, lang, orders);
  }

  const matched = matchProducts(text);
  const country = detectCountry(text);
  const shipWord = has(text, ["ship", "kargo", "teslimat", "deliver", "gonder", "sevkiyat", "yurt disi", "international", "cargo"]);

  if (has(text, medicalKeywords)) return medicalAnswer(matched, lang);
  if (has(text, ["human", "insan", "temsilci", "musteri hizmet", "customer service", "customer support", "agent", "iletisim", "contact", "phone", "telefon", "call"]) && !shipWord) return humanAnswer(lang);

  if (has(text, ["discount", "indirim", "coupon", "kupon", "promo", "kampanya", "daily deal", "deal", "firsat"]) || hasWord(text, ["kod", "code"])) {
    return discountAnswer(lang);
  }
  if (has(text, ["payment", "odeme", "pay ", "credit card", "kredi kart", "card"]) || hasWord(text, ["pay", "kart"])) return paymentAnswer(lang);
  if (has(text, ["return", "iade", "refund", "geri odeme", "degisim", "exchange"])) return returnsAnswer(lang);

  const asksCountries = has(text, ["which countr", "what countr", "hangi ulke", "ulkelere", "ulkeye", "countries", "where do you ship", "where can you ship", "yurt disi", "international", "nerelere"]);
  const asksTime = has(text, ["how long", "kac gun", "kac is gun", "ne kadar surer", "delivery time", "teslimat sure", "transit", "arrive", "ulas", "eta", "ne zaman", "gunde"]);
  const asksCost = has(text, ["shipping cost", "shipping fee", "shipping rate", "free shipping", "kargo ucret", "kargo ne kadar", "kargo fiyat", "ucretsiz kargo", "how much is shipping", "kargo bedel"]);

  if (asksCost) return shippingCost(country, lang);
  if (asksCountries && !country) return countriesList(lang);
  if ((shipWord || asksCountries) && country && asksTime) return deliveryTime(country, lang);
  if (asksTime && shipWord) return deliveryTime(country, lang);
  if (country && (shipWord || asksCountries)) return countryDetail(country, lang);
  if (shipWord && !matched.length && has(text, unsupportedDestinations)) return unsupportedDestination(lang);
  if (shipWord && !matched.length) return asksTime ? deliveryTime(undefined, lang) : countriesList(lang);
  if (asksTime && !matched.length && !detectGoals(text).length) return deliveryTime(country, lang);

  if (has(text, ["each supplement", "every supplement", "all products", "her urun", "hangi supplement", "hangi takviye", "tum urun", "what do you sell", "what do you have", "neler var", "rehber", "guide", "which supplement", "what is each", "what each", "which product is for", "ne icin", "urunler", "what products", "product range", "catalog", "katalog"]) && !matched.length && !detectGoals(text).length) {
    return guideAnswer(lang);
  }

  if (matched.length) return productAnswer(matched, text, lang);

  const goalIds = detectGoals(text);
  if (goalIds.length) return goalAnswer(goalIds, lang);

  if (hasWord(text, ["hi", "hello", "hey", "merhaba", "selam", "slm", "thanks", "thank", "tesekkurler", "tesekkur", "sagol"]) || text.split(" ").length <= 2) {
    if (hasWord(text, ["hi", "hello", "hey", "merhaba", "selam", "slm"])) return greeting(lang);
    if (hasWord(text, ["thanks", "thank", "tesekkurler", "tesekkur", "sagol"])) {
      return { intent: "greeting", text: pick(lang, "You're welcome. Anything else I can check?", "Rica ederim. Başka bir şey bakmamı ister misin?"), suggestions: suggestionsFor(lang, "start") };
    }
  }
  return fallback(lang);
}
