import type { CountryCode } from "@/config/shipping";
import type { GoalId } from "@/domain/types";
import type { Lang } from "./types";

type Text = Record<Lang, string>;

interface Guide {
  /** Folded search terms that point at this product. */
  terms: string[];
  what: Text;
  typical: Text;
}

/**
 * Plain descriptions of what each demo product is and how people commonly use it.
 * Deliberately free of health or performance claims: nothing here says a product
 * treats, prevents or guarantees anything.
 */
export const productGuides: Record<string, Guide> = {
  whey: {
    terms: ["whey", "protein tozu", "protein powder"],
    what: {
      en: "a whey protein concentrate powder, an easy way to add protein to your day",
      tr: "whey protein konsantresi tozu; günlük protein alımına pratik bir ekleme",
    },
    typical: {
      en: "Commonly used after training or whenever a quick protein serving is handy.",
      tr: "Genellikle antrenman sonrası ya da hızlı bir protein porsiyonu gerektiğinde kullanılır.",
    },
  },
  isolate: {
    terms: ["isolate", "izolat", "iso whey"],
    what: {
      en: "a whey protein isolate, a more refined whey with less carbohydrate and fat per serving than a concentrate (illustrative figures)",
      tr: "whey protein izolat; konsantreye göre porsiyon başına daha az karbonhidrat ve yağ içeren, daha rafine bir whey (gösterim amaçlı değerler)",
    },
    typical: {
      en: "Often chosen by people who want a lean, low-carbohydrate protein option.",
      tr: "Yağsız, düşük karbonhidratlı bir protein seçeneği isteyenler tarafından sık tercih edilir.",
    },
  },
  creatine: {
    terms: ["creatine", "kreatin", "kreatine"],
    what: {
      en: "a single-ingredient, unflavoured creatine monohydrate powder",
      tr: "tek içerikli, aromasız kreatin monohidrat tozu",
    },
    typical: {
      en: "Commonly taken daily by people who do strength or high-intensity training.",
      tr: "Kuvvet ya da yüksek yoğunluklu antrenman yapanlar tarafından sıkça her gün kullanılır.",
    },
  },
  "creatine-blueberry": {
    terms: ["blueberry", "yaban mersini"],
    what: {
      en: "the same creatine monohydrate with a blueberry flavour (300 g) and the current daily deal",
      tr: "aynı kreatin monohidrat, yaban mersini aromalı (300 g); günün fırsatı",
    },
    typical: {
      en: "Used the same way as plain creatine, for people who prefer a flavoured powder.",
      tr: "Sade kreatinle aynı şekilde kullanılır; aromalı toz tercih edenler için.",
    },
  },
  "pre-workout": {
    terms: ["pre workout", "preworkout", "pre antrenman", "preworkout"],
    what: {
      en: "a caffeinated pre-workout powder (200 mg caffeine per serving in this demo) in three flavours",
      tr: "kafeinli pre-workout tozu (bu demoda porsiyon başına 200 mg kafein), üç aroma",
    },
    typical: {
      en: "Taken 20-30 minutes before training by people who want a stimulant pre-workout. Not for under 18s, and best avoided late in the day.",
      tr: "Uyarıcılı pre-workout isteyenler antrenmandan 20-30 dakika önce kullanır. 18 yaş altına uygun değildir, akşam geç saatlerde kullanmaktan kaçının.",
    },
  },
  bcaa: {
    terms: ["bcaa", "branched"],
    what: {
      en: "a BCAA (leucine, isoleucine, valine) amino acid powder",
      tr: "BCAA (lösin, izolösin, valin) amino asit tozu",
    },
    typical: {
      en: "Commonly sipped during training sessions.",
      tr: "Genellikle antrenman sırasında içilir.",
    },
  },
  eaa: {
    terms: ["eaa", "essential amino", "esansiyel amino"],
    what: {
      en: "an essential amino acid powder with all nine essential amino acids",
      tr: "dokuz esansiyel amino asidin hepsini içeren amino asit tozu",
    },
    typical: {
      en: "Commonly used around training sessions.",
      tr: "Genellikle antrenman öncesi, sırası ya da sonrasında kullanılır.",
    },
  },
  "mass-gainer": {
    terms: ["gainer", "mass gainer", "karbonhidrat tozu"],
    what: {
      en: "a calorie-dense shake powder in 1.5, 3 and 6 kg bags",
      tr: "1,5, 3 ve 6 kg paketlerde yüksek kalorili shake tozu",
    },
    typical: {
      en: "Used by people who find it hard to eat enough to gain weight. Weight gain still depends on your overall diet and training.",
      tr: "Yeterince yemekte zorlananlar tarafından kullanılır. Kilo almak yine genel beslenmene ve antrenmanına bağlıdır.",
    },
  },
  casein: {
    terms: ["casein", "kazein", "kasein"],
    what: {
      en: "a slow-mixing micellar casein protein powder",
      tr: "yavaş karışan mikellar kazein protein tozu",
    },
    typical: {
      en: "Commonly taken in the evening or between long gaps in meals because it digests slowly.",
      tr: "Yavaş sindirildiği için genellikle akşam ya da uzun öğün aralarında kullanılır.",
    },
  },
  "liquid-carnitine": {
    terms: ["liquid carnitine", "sivi karnitin", "sivi l carnitine", "liquid l carnitine"],
    what: {
      en: "a one-litre bottle of liquid L-carnitine with a measured cap",
      tr: "ölçü kapaklı, bir litrelik sıvı L-karnitin şişesi",
    },
    typical: {
      en: "Commonly used by people following calorie-controlled training plans. It does not burn fat by itself.",
      tr: "Kalori kontrollü antrenman planı izleyenler tarafından sık kullanılır. Tek başına yağ yakmaz.",
    },
  },
  "carnitine-tablets": {
    terms: ["carnitine tablet", "karnitin tablet", "l carnitine tablet", "carnitine tablets"],
    what: {
      en: "L-carnitine in tablet form, for people who do not want a bottle",
      tr: "şişe istemeyenler için tablet formunda L-karnitin",
    },
    typical: {
      en: "Used the same way as other carnitine products within a calorie-controlled plan. It does not burn fat by itself.",
      tr: "Kalori kontrollü bir plan içinde diğer karnitin ürünleriyle aynı şekilde kullanılır. Tek başına yağ yakmaz.",
    },
  },
  caffeine: {
    terms: ["caffeine", "kafein"],
    what: {
      en: "caffeine tablets, a simple measured source of caffeine without flavour or sugar",
      tr: "aromasız ve şekersiz, ölçülü kafein kaynağı kafein tabletleri",
    },
    typical: {
      en: "People use them for an energy boost around training or early in the day. Keep track of your total daily caffeine.",
      tr: "Antrenman çevresinde ya da günün erken saatlerinde enerji için kullanılır. Günlük toplam kafeinini takip et.",
    },
  },
  "omega-3": {
    terms: ["omega", "balik yagi", "fish oil"],
    what: {
      en: "omega-3 fish oil softgels (anchovy, sardine, mackerel), taken with a meal",
      tr: "öğünle alınan omega-3 balık yağı yumuşak kapsülleri (hamsi, sardalya, uskumru)",
    },
    typical: {
      en: "A daily-health product people commonly add to their routine. Contains fish.",
      tr: "Günlük rutine sık eklenen bir sağlık ürünü. Balık içerir.",
    },
  },
  multivitamin: {
    terms: ["multivitamin", "multi vitamin", "vitamin", "mineral"],
    what: {
      en: "a once-a-day multivitamin tablet",
      tr: "günde bir tablet multivitamin",
    },
    typical: {
      en: "A daily-health product that does not replace a varied, balanced diet.",
      tr: "Günlük sağlık ürünü; çeşitli ve dengeli beslenmenin yerini tutmaz.",
    },
  },
};

/** Broad words that map to a family of products when no specific product is named. */
export const productFamilies: { terms: string[]; ids: string[] }[] = [
  { terms: ["amino"], ids: ["bcaa", "eaa"] },
  { terms: ["protein"], ids: ["whey", "isolate", "casein"] },
  { terms: ["carnitine", "karnitin"], ids: ["liquid-carnitine", "carnitine-tablets"] },
];

export const goalKeywords: Record<GoalId, { prefixes: string[]; words?: string[] }> = {
  "muscle-gain": {
    prefixes: ["muscle", "kas kazan", "kas yap", "kas gelis", "kas kutle", "hypertroph", "lean mass"],
    words: ["kas"],
  },
  "mass-gain": {
    prefixes: ["kilo al", "mass gain", "gain weight", "weight gain", "bulk", "hardgainer", "hard gainer", "zayif", "hacim", "kutle kazan", "mass kazan"],
  },
  "fat-burn": {
    prefixes: ["fat burn", "yag yak", "yag", "fat loss", "lose weight", "kilo ver", "zayifla", "diyet", "cutting", "definasyon", "definition", "burn fat"],
  },
  performance: {
    prefixes: ["performance", "performans", "energy", "enerji", "endurance", "dayanikl", "strength", "workout", "antrenman", "stamina"],
    words: ["guc"],
  },
  health: {
    prefixes: ["health", "saglik", "gunluk", "general wellness", "immune", "bagisiklik"],
  },
};

interface CountryAliases {
  prefixes: string[];
  words?: string[];
}

export const countryAliases: Record<CountryCode, CountryAliases> = {
  TR: { prefixes: ["turkiye", "turkey", "turkei", "istanbul", "ankara", "izmir", "bursa", "antalya"], words: ["tr"] },
  US: { prefixes: ["united states", "amerika", "america", "usa", "abd"], words: ["us"] },
  CA: { prefixes: ["canada", "kanada"] },
  DE: { prefixes: ["germany", "almanya", "deutschland", "berlin"] },
  AT: { prefixes: ["austria", "avusturya", "osterreich", "vienna", "viyana"] },
  GB: { prefixes: ["united kingdom", "ingiltere", "britain", "birlesik krallik", "england", "scotland", "london", "londra"], words: ["uk", "gb"] },
};

/** Destinations people ask about that this demo does not serve. */
export const unsupportedDestinations = [
  "france", "fransa", "spain", "ispanya", "italy", "italya", "japan", "japonya", "china", "cin", "netherlands",
  "hollanda", "australia", "avustralya", "russia", "rusya", "greece", "yunanistan", "azerbaijan", "azerbaycan",
  "saudi", "suudi", "uae", "dubai", "emirates", "india", "hindistan", "brazil", "brezilya", "mexico", "meksika",
  "ireland", "irlanda", "belgium", "belcika", "sweden", "isvec", "norway", "norvec", "poland", "polonya",
  "switzerland", "isvicre", "cyprus", "kibris", "romania", "romanya", "bulgaria", "bulgaristan", "ukraine", "ukrayna",
];

export const medicalKeywords = [
  "pregnan", "hamile", "breastfeed", "emzir", "medication", "medicine", "ilac", "disease", "hastalik", "condition",
  "doctor", "doktor", "tansiyon", "blood pressure", "heart", "kalp", "kidney", "bobrek", "diabet", "seker hastal",
  "under 18", "18 yas", "cocuk", "child", "teen", "genc", "allerj", "allerg", "side effect", "yan etki", "safe", "guvenli",
  "zararli", "harmful", "treat", "tedavi", "cure",
];
