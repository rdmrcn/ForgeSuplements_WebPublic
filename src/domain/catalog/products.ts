import { slugify } from "@/lib/format";
import type { CategoryId, Nutrition, Product, Variant } from "../types";

/**
 * DEMO CATALOG
 * Every product, price, formulation and nutrition value below is invented for
 * this portfolio demo. None of it is verified label data, laboratory tested,
 * or sale-ready. Replace this module (or back it with a database) before any
 * real commerce use.
 */

interface SizeSpec {
  size: string;
  weightGrams: number;
  priceCents: number;
  compareAtCents?: number;
  servings?: number;
}

interface FlavorSpec {
  name: string;
  hex: string;
}

const DEFAULT_STOCK = 40;

function buildVariants(
  productId: string,
  code: string,
  sizes: SizeSpec[],
  flavors?: FlavorSpec[],
  stock: Record<string, number> = {},
): Variant[] {
  const variants: Variant[] = [];
  for (const flavor of flavors ?? [undefined]) {
    for (const size of sizes) {
      const id = [productId, flavor ? slugify(flavor.name) : null, slugify(size.size)]
        .filter(Boolean)
        .join("-");
      variants.push({
        id,
        sku: `FRG-${code}-${flavor ? slugify(flavor.name).slice(0, 4).toUpperCase() + "-" : ""}${slugify(size.size).toUpperCase()}`,
        size: size.size,
        flavor: flavor?.name,
        flavorHex: flavor?.hex,
        priceCents: size.priceCents,
        compareAtCents: size.compareAtCents,
        weightGrams: size.weightGrams,
        servings: size.servings,
        stock: stock[id] ?? DEFAULT_STOCK,
      });
    }
  }
  return variants;
}

function nutrition(servingSize: string, rows: Array<[string, string, boolean?]>): Nutrition {
  return {
    servingSize,
    illustrative: true,
    rows: rows.map(([label, value, indent]) => ({ label, value, indent })),
  };
}

const commonWarnings = [
  "Food supplements must not replace a varied and balanced diet and a healthy lifestyle.",
  "Do not exceed the stated serving. Keep out of reach of children.",
  "Store in a cool, dry place away from direct sunlight.",
];

const milkAllergen =
  "Contains milk. Contains soya lecithin in some flavours. Produced in a facility that also handles egg, gluten, peanuts and tree nuts (illustrative allergen statement).";

const wheyFlavors: FlavorSpec[] = [
  { name: "Dark Cocoa", hex: "#6a4630" },
  { name: "Vanilla Bean", hex: "#e8d9a8" },
  { name: "Strawberry Cream", hex: "#ea8fa6" },
  { name: "Salted Caramel", hex: "#cf9242" },
];

export const products: Product[] = [
  {
    id: "whey",
    slug: "standard-whey-protein",
    title: "Standard Whey Protein",
    shortTitle: "Whey Protein",
    categoryId: "protein",
    goals: ["muscle-gain", "mass-gain"],
    tagline: "Everyday whey protein concentrate in four flavours.",
    description: [
      "Standard Whey is the workhorse of the range: a whey protein concentrate powder that mixes quickly in a shaker, tastes like the flavour on the label and fits into breakfast, post-training or a late snack.",
      "It is made from whey protein concentrate, which keeps a little more of the natural milk carbohydrate and fat than our Isolate. If you want a leaner, higher-protein powder, look at Whey Isolate instead.",
    ],
    highlights: [
      "Whey protein concentrate",
      "Four flavours, two bag sizes",
      "Mixes in a shaker in under 30 seconds",
      "No added creatine or stimulants",
    ],
    variants: buildVariants(
      "whey",
      "WHY",
      [
        { size: "900 g", weightGrams: 900, priceCents: 2990, servings: 30 },
        { size: "2 kg", weightGrams: 2000, priceCents: 5490, compareAtCents: 5990, servings: 66 },
      ],
      wheyFlavors,
      { "whey-strawberry-cream-2-kg": 0, "whey-salted-caramel-900-g": 6 },
    ),
    defaultVariantId: "whey-dark-cocoa-900-g",
    ingredients:
      "Whey protein concentrate (milk), flavouring, cocoa powder (Dark Cocoa only), thickener (xanthan gum), emulsifier (sunflower lecithin), sweetener (sucralose). Demo formulation, not a verified label.",
    allergens: milkAllergen,
    nutrition: nutrition("1 scoop (30 g)", [
      ["Energy", "493 kJ / 117 kcal"],
      ["Protein", "23 g"],
      ["Carbohydrate", "2.4 g"],
      ["of which sugars", "1.6 g", true],
      ["Fat", "1.7 g"],
      ["of which saturates", "1.0 g", true],
      ["Salt", "0.2 g"],
    ]),
    directions:
      "Mix one level scoop (30 g) with 200-250 ml of cold water or milk in a shaker. Take 1-2 servings per day, alongside your normal diet.",
    warnings: commonWarnings,
    related: ["isolate", "creatine", "casein", "mass-gainer"],
    pack: {
      kind: "tub",
      body: "black",
      lines: ["WHEY", "PROTEIN"],
      descriptor: "Whey protein concentrate",
      accent: "#ff5a1f",
      flavorDriven: true,
    },
    keywords: ["whey", "protein", "shake", "concentrate", "milk"],
    badges: ["Best seller"],
    addedAt: "2026-01-12",
    featuredRank: 1,
    bestSellerRank: 1,
  },
  {
    id: "isolate",
    slug: "whey-protein-isolate",
    title: "Whey Protein Isolate",
    shortTitle: "Whey Isolate",
    categoryId: "protein",
    goals: ["muscle-gain", "fat-burn"],
    tagline: "A cleaner, higher-protein whey in a bone-white tub.",
    description: [
      "Whey Isolate is built on whey protein isolate rather than concentrate. In this demo formulation that means more protein and less carbohydrate and fat per scoop than Standard Whey, with a lighter texture in the shaker.",
      "It is the same brand and the same easy mixing, but a clearly different product: different formulation, different tub and a higher price per kilo.",
    ],
    highlights: [
      "Whey protein isolate as the single protein source",
      "More protein per scoop than Standard Whey",
      "Light texture, nothing gritty",
      "Three flavours including Unflavoured",
    ],
    variants: buildVariants(
      "isolate",
      "ISO",
      [
        { size: "750 g", weightGrams: 750, priceCents: 3990, servings: 25 },
        { size: "1.5 kg", weightGrams: 1500, priceCents: 7290, compareAtCents: 7990, servings: 50 },
      ],
      [
        { name: "Dark Cocoa", hex: "#6a4630" },
        { name: "Vanilla Bean", hex: "#e8d9a8" },
        { name: "Unflavoured", hex: "#d4cebf" },
      ],
      { "isolate-unflavoured-1-5-kg": 9 },
    ),
    defaultVariantId: "isolate-dark-cocoa-750-g",
    ingredients:
      "Whey protein isolate (milk), flavouring, cocoa powder (Dark Cocoa only), emulsifier (sunflower lecithin), sweetener (sucralose, absent in Unflavoured). Demo formulation, not a verified label.",
    allergens: milkAllergen,
    nutrition: nutrition("1 scoop (30 g)", [
      ["Energy", "468 kJ / 110 kcal"],
      ["Protein", "26 g"],
      ["Carbohydrate", "0.8 g"],
      ["of which sugars", "0.5 g", true],
      ["Fat", "0.4 g"],
      ["of which saturates", "0.2 g", true],
      ["Salt", "0.25 g"],
    ]),
    directions:
      "Mix one level scoop (30 g) with 200-250 ml of cold water in a shaker. Take 1-2 servings per day, alongside your normal diet.",
    warnings: commonWarnings,
    related: ["whey", "casein", "creatine", "eaa"],
    pack: {
      kind: "tub",
      body: "bone",
      lines: ["WHEY", "ISOLATE"],
      descriptor: "Whey protein isolate",
      accent: "#161615",
      flavorDriven: true,
    },
    keywords: ["whey", "isolate", "protein", "lean", "low carb"],
    badges: ["New"],
    addedAt: "2026-04-02",
    featuredRank: 2,
    bestSellerRank: 3,
  },
  {
    id: "creatine",
    slug: "creatine-monohydrate",
    title: "Creatine Monohydrate",
    shortTitle: "Creatine",
    categoryId: "creatine",
    goals: ["muscle-gain", "performance"],
    tagline: "One ingredient. Unflavoured. Two sizes.",
    description: [
      "Creatine Monohydrate is exactly what it says on the tub: a single-ingredient creatine powder with no flavouring, sweeteners or fillers in this demo formulation.",
      "Stir it into water, a shake or your pre-workout. The 600 g tub works out cheaper per serving; the 300 g tub is a lighter way to start.",
    ],
    highlights: [
      "Single ingredient, unflavoured",
      "Dissolves in water, juice or a shake",
      "300 g and 600 g tubs",
      "Vegan-friendly formulation (demo)",
    ],
    variants: buildVariants("creatine", "CRE", [
      { size: "300 g", weightGrams: 300, priceCents: 1990, servings: 60 },
      { size: "600 g", weightGrams: 600, priceCents: 3490, compareAtCents: 3980, servings: 120 },
    ], undefined, { "creatine-300-g": 14 }),
    defaultVariantId: "creatine-300-g",
    ingredients: "Creatine monohydrate. Demo formulation, not a verified label.",
    nutrition: nutrition("1 scoop (5 g)", [
      ["Creatine monohydrate", "5 g"],
      ["Energy", "0 kcal"],
    ]),
    directions:
      "Mix one level scoop (5 g) into 200 ml of water or your shake once per day. Take it every day, including rest days.",
    warnings: [
      ...commonWarnings,
      "If you have a medical condition or are taking medication, speak to a doctor before using creatine.",
    ],
    related: ["whey", "pre-workout", "isolate", "bcaa"],
    pack: {
      kind: "tub",
      body: "charcoal",
      lines: ["CREATINE", "MONOHYDRATE"],
      descriptor: "Creatine monohydrate powder",
      accent: "#e5ded0",
    },
    keywords: ["creatine", "monohydrate", "strength", "unflavoured"],
    badges: ["Best seller"],
    addedAt: "2026-01-12",
    featuredRank: 3,
    bestSellerRank: 2,
  },
  {
    id: "creatine-blueberry",
    slug: "creatine-blueberry",
    title: "Creatine Monohydrate Blueberry",
    shortTitle: "Creatine Blueberry",
    categoryId: "creatine",
    goals: ["muscle-gain", "performance"],
    tagline: "The same creatine, now in blueberry. 300 g.",
    description: [
      "Creatine Monohydrate Blueberry is our new flavoured creatine: the same 5 g of creatine monohydrate per serving as the unflavoured tub, with a light blueberry flavour so it tastes like something in plain water.",
      "It comes in a single 300 g tub and is today's daily deal in this demo store.",
    ],
    highlights: [
      "New: blueberry flavour",
      "5 g creatine monohydrate per serving",
      "300 g tub, 50 servings",
      "Dissolves in water, juice or a shake",
    ],
    variants: buildVariants(
      "creatine-blueberry",
      "CRB",
      [{ size: "300 g", weightGrams: 300, priceCents: 1590, compareAtCents: 1990, servings: 50 }],
      [{ name: "Blueberry", hex: "#4b5bd1" }],
      { "creatine-blueberry-blueberry-300-g": 25 },
    ),
    defaultVariantId: "creatine-blueberry-blueberry-300-g",
    ingredients:
      "Creatine monohydrate, flavouring, acidity regulator (citric acid), sweetener (sucralose), colour. Demo formulation, not a verified label.",
    nutrition: nutrition("1 scoop (6 g)", [
      ["Creatine monohydrate", "5 g"],
      ["Energy", "0 kcal"],
    ]),
    directions:
      "Mix one level scoop (6 g) into 200 ml of water or your shake once per day. Take it every day, including rest days.",
    warnings: [
      ...commonWarnings,
      "If you have a medical condition or are taking medication, speak to a doctor before using creatine.",
    ],
    related: ["creatine", "pre-workout", "whey", "eaa"],
    pack: {
      kind: "tub",
      body: "slate",
      lines: ["CREATINE", "BLUEBERRY"],
      descriptor: "Creatine monohydrate powder",
      accent: "#4b5bd1",
      flavorDriven: true,
    },
    keywords: ["creatine", "blueberry", "monohydrate", "flavoured", "deal", "daily deal"],
    badges: ["Daily deal", "New"],
    addedAt: "2026-10-20",
    featuredRank: 4,
    bestSellerRank: 5,
  },
  {
    id: "pre-workout",
    slug: "pre-workout",
    title: "Pre-Workout",
    shortTitle: "Pre-Workout",
    categoryId: "pre-workout",
    goals: ["performance"],
    tagline: "A stimulant pre-workout in three loud flavours.",
    description: [
      "Pre-Workout is a caffeinated powder for the session you have been looking forward to all day. Three flavours, one 450 g tub, one formula.",
      "It is a high-caffeine product in this demo specification. Read the warnings, start with a half scoop if you are unsure, and do not take it late in the evening.",
    ],
    highlights: [
      "450 g tub",
      "Raspberry, Sour Lemon and Watermelon Punch",
      "Contains caffeine",
      "Not for under 18s",
    ],
    variants: buildVariants(
      "pre-workout",
      "PRE",
      [{ size: "450 g", weightGrams: 450, priceCents: 3490, servings: 30 }],
      [
        { name: "Raspberry", hex: "#d4194d" },
        { name: "Sour Lemon", hex: "#d4df2a" },
        { name: "Watermelon Punch", hex: "#ff5c7c" },
      ],
      { "pre-workout-sour-lemon-450-g": 3 },
    ),
    defaultVariantId: "pre-workout-raspberry-450-g",
    ingredients:
      "Citrulline malate, beta-alanine, caffeine anhydrous, taurine, flavouring, acidity regulator (citric acid), sweetener (sucralose), colour. Demo formulation, not a verified label.",
    nutrition: nutrition("1 scoop (15 g)", [
      ["Energy", "21 kJ / 5 kcal"],
      ["Citrulline malate", "6 g"],
      ["Beta-alanine", "3 g"],
      ["Taurine", "1 g"],
      ["Caffeine", "200 mg"],
    ]),
    directions:
      "Assess your tolerance with half a scoop. Mix one scoop (15 g) with 250 ml of water and drink 20-30 minutes before training. Do not exceed one serving per day.",
    warnings: [
      "High caffeine content (200 mg per serving). Not recommended for children, pregnant or breast-feeding women, or people sensitive to caffeine.",
      "Do not take within six hours of bedtime.",
      ...commonWarnings,
    ],
    related: ["creatine", "bcaa", "caffeine", "eaa"],
    pack: {
      kind: "tub",
      body: "black",
      lines: ["PRE", "WORKOUT"],
      descriptor: "Pre-workout powder",
      accent: "#ff5a1f",
      flavorDriven: true,
    },
    keywords: ["pre", "preworkout", "pump", "energy", "caffeine", "raspberry", "lemon", "watermelon"],
    badges: ["Flavour range"],
    addedAt: "2026-02-20",
    featuredRank: 4,
    bestSellerRank: 4,
  },
  {
    id: "bcaa",
    slug: "bcaa",
    title: "BCAA Powder",
    shortTitle: "BCAA",
    categoryId: "amino-acids",
    goals: ["muscle-gain", "performance"],
    tagline: "Branched-chain aminos for the bottle in your gym bag.",
    description: [
      "BCAA Powder is a branched-chain amino acid drink mix: leucine, isoleucine and valine in a fruit-forward flavour that goes into a bottle of water and stays there.",
      "If you already eat enough protein, BCAAs are optional. They are here for people who like to sip something during long sessions.",
    ],
    highlights: [
      "Leucine, isoleucine and valine",
      "Two flavours, 400 g tub",
      "Dissolves clean in cold water",
      "No caffeine",
    ],
    variants: buildVariants(
      "bcaa",
      "BCA",
      [{ size: "400 g", weightGrams: 400, priceCents: 2490, servings: 40 }],
      [
        { name: "Green Apple", hex: "#8fcf3c" },
        { name: "Peach Iced Tea", hex: "#ffb067" },
      ],
    ),
    defaultVariantId: "bcaa-green-apple-400-g",
    ingredients:
      "L-leucine, L-isoleucine, L-valine, flavouring, acidity regulator (citric acid), anti-caking agent (silicon dioxide), sweetener (sucralose), colour. Demo formulation, not a verified label.",
    nutrition: nutrition("1 scoop (10 g)", [
      ["Energy", "17 kJ / 4 kcal"],
      ["L-leucine", "5 g"],
      ["L-isoleucine", "2.5 g"],
      ["L-valine", "2.5 g"],
    ]),
    directions: "Mix one scoop (10 g) into 300-400 ml of water. Take 1-2 servings per day, before or during training.",
    warnings: commonWarnings,
    related: ["eaa", "creatine", "pre-workout", "isolate"],
    pack: {
      kind: "tub",
      body: "slate",
      lines: ["BCAA"],
      descriptor: "Branched-chain amino acids",
      accent: "#8fcf3c",
      flavorDriven: true,
    },
    keywords: ["bcaa", "amino", "leucine", "recovery", "intra"],
    badges: [],
    addedAt: "2026-02-02",
    featuredRank: 8,
    bestSellerRank: 6,
  },
  {
    id: "eaa",
    slug: "eaa",
    title: "EAA Powder",
    shortTitle: "EAA",
    categoryId: "amino-acids",
    goals: ["muscle-gain", "performance"],
    tagline: "All nine essential amino acids in one scoop.",
    description: [
      "EAA Powder contains all nine essential amino acids, which makes it a different product from our BCAA, not a re-labelled copy of it.",
      "It is a useful option when you cannot get a whole-food meal or protein shake in, or simply prefer a flavoured drink to a milky one.",
    ],
    highlights: [
      "All nine essential amino acids",
      "Mixed Berry and Orange Zest",
      "400 g tub, 40 servings",
      "No caffeine",
    ],
    variants: buildVariants(
      "eaa",
      "EAA",
      [{ size: "400 g", weightGrams: 400, priceCents: 2990, servings: 40 }],
      [
        { name: "Mixed Berry", hex: "#8a3fd0" },
        { name: "Orange Zest", hex: "#ff9a1f" },
      ],
      { "eaa-orange-zest-400-g": 0 },
    ),
    defaultVariantId: "eaa-mixed-berry-400-g",
    ingredients:
      "L-leucine, L-lysine, L-valine, L-isoleucine, L-phenylalanine, L-threonine, L-methionine, L-histidine, L-tryptophan, flavouring, acidity regulator (citric acid), sweetener (sucralose), colour. Demo formulation, not a verified label.",
    nutrition: nutrition("1 scoop (10 g)", [
      ["Energy", "17 kJ / 4 kcal"],
      ["Total essential amino acids", "8.5 g"],
      ["L-leucine", "2.5 g", true],
      ["L-lysine", "1.4 g", true],
    ]),
    directions: "Mix one scoop (10 g) into 300-400 ml of water. Take 1-2 servings per day.",
    warnings: commonWarnings,
    related: ["bcaa", "isolate", "creatine", "multivitamin"],
    pack: {
      kind: "tub",
      body: "slate",
      lines: ["EAA"],
      descriptor: "Essential amino acids",
      accent: "#8a3fd0",
      flavorDriven: true,
    },
    keywords: ["eaa", "essential", "amino", "recovery"],
    badges: ["New"],
    addedAt: "2026-04-18",
    featuredRank: 9,
    bestSellerRank: 7,
  },
  {
    id: "mass-gainer",
    slug: "mass-gainer",
    title: "Mass Gainer",
    shortTitle: "Mass Gainer",
    categoryId: "mass-gainers",
    goals: ["mass-gain"],
    tagline: "A calorie-dense shake for people who struggle to eat enough.",
    description: [
      "Mass Gainer blends protein with carbohydrate powder to build an easy, high-calorie shake. It comes in three bag sizes so you can try it before committing to six kilos.",
      "It is deliberately high in energy. If you are not looking to increase your calorie intake, choose Whey Protein instead.",
    ],
    highlights: [
      "Protein plus carbohydrate blend",
      "1.5 kg, 3 kg and 6 kg bags",
      "Chocolate Brownie and Vanilla Cream",
      "Per-bag pricing that gets cheaper per kilo",
    ],
    variants: buildVariants(
      "mass-gainer",
      "MAS",
      [
        { size: "1.5 kg", weightGrams: 1500, priceCents: 2490, servings: 10 },
        { size: "3 kg", weightGrams: 3000, priceCents: 4290, servings: 20 },
        { size: "6 kg", weightGrams: 6000, priceCents: 7490, compareAtCents: 8490, servings: 40 },
      ],
      [
        { name: "Chocolate Brownie", hex: "#6b4026" },
        { name: "Vanilla Cream", hex: "#e8d9a8" },
      ],
      { "mass-gainer-chocolate-brownie-6-kg": 4, "mass-gainer-vanilla-cream-6-kg": 0 },
    ),
    defaultVariantId: "mass-gainer-chocolate-brownie-3-kg",
    ingredients:
      "Maltodextrin, whey protein concentrate (milk), oat flour, milk protein, cocoa powder (Chocolate Brownie only), flavouring, sunflower oil powder, thickener (xanthan gum), sweetener (sucralose). Demo formulation, not a verified label.",
    allergens: milkAllergen + " Contains oats (gluten).",
    nutrition: nutrition("1 serving (150 g)", [
      ["Energy", "2.3 MJ / 551 kcal"],
      ["Protein", "30 g"],
      ["Carbohydrate", "98 g"],
      ["of which sugars", "9 g", true],
      ["Fat", "4.8 g"],
      ["of which saturates", "1.7 g", true],
      ["Salt", "0.5 g"],
    ]),
    directions:
      "Mix 150 g (about 3 scoops) with 400-500 ml of cold water or milk. Take one serving per day, alongside meals.",
    warnings: commonWarnings,
    related: ["whey", "casein", "creatine", "isolate"],
    pack: {
      kind: "pouch",
      body: "umber",
      lines: ["MASS", "GAINER"],
      descriptor: "High-calorie powder",
      accent: "#ff5a1f",
      flavorDriven: true,
    },
    keywords: ["mass", "gainer", "bulk", "calories", "weight gain"],
    badges: [],
    addedAt: "2026-03-05",
    featuredRank: 6,
    bestSellerRank: 5,
  },
  {
    id: "casein",
    slug: "casein-protein",
    title: "Casein Protein",
    shortTitle: "Casein",
    categoryId: "protein",
    goals: ["muscle-gain", "mass-gain"],
    tagline: "Slow-mixing casein for evenings and long gaps between meals.",
    description: [
      "Casein is the other milk protein. It digests more slowly than whey, which is why many people keep it for the evening or for long stretches without food.",
      "It thickens in the shaker, almost like a pudding if you use less water. Our 500 g tub comes in two flavours.",
    ],
    highlights: [
      "Micellar casein",
      "500 g tub, about 16 servings",
      "Thick, pudding-style texture",
      "Two flavours",
    ],
    variants: buildVariants(
      "casein",
      "CAS",
      [{ size: "500 g", weightGrams: 500, priceCents: 2790, servings: 16 }],
      [
        { name: "Dark Cocoa", hex: "#6a4630" },
        { name: "Vanilla Bean", hex: "#e8d9a8" },
      ],
    ),
    defaultVariantId: "casein-dark-cocoa-500-g",
    ingredients:
      "Micellar casein (milk), flavouring, cocoa powder (Dark Cocoa only), thickener (xanthan gum), sweetener (sucralose). Demo formulation, not a verified label.",
    allergens: milkAllergen,
    nutrition: nutrition("1 scoop (31 g)", [
      ["Energy", "481 kJ / 114 kcal"],
      ["Protein", "24 g"],
      ["Carbohydrate", "2.2 g"],
      ["of which sugars", "1.1 g", true],
      ["Fat", "0.9 g"],
      ["Salt", "0.3 g"],
    ]),
    directions: "Mix one scoop (31 g) with 250-300 ml of cold water or milk. Shake well; it thickens on standing.",
    warnings: commonWarnings,
    related: ["whey", "isolate", "mass-gainer", "multivitamin"],
    pack: {
      kind: "tub",
      body: "umber",
      lines: ["CASEIN"],
      descriptor: "Slow-release casein protein",
      accent: "#e8c9a0",
      flavorDriven: true,
    },
    keywords: ["casein", "night", "slow", "protein", "micellar"],
    badges: [],
    addedAt: "2026-03-14",
    featuredRank: 7,
    bestSellerRank: 8,
  },
  {
    id: "liquid-carnitine",
    slug: "liquid-l-carnitine",
    title: "Liquid L-Carnitine",
    shortTitle: "Liquid L-Carnitine",
    categoryId: "carnitine-energy",
    goals: ["fat-burn", "performance"],
    tagline: "A one-litre bottle with a measured serving cap.",
    description: [
      "Liquid L-Carnitine is a ready-to-measure drink concentrate in a one-litre bottle. It is a different format from our L-Carnitine Tablets: you measure a serving rather than swallow a tablet.",
      "Add a measured serving to water or take it straight, as you prefer. Shake before use and refrigerate after opening.",
    ],
    highlights: [
      "1 litre bottle",
      "Two flavours",
      "Measure-and-pour serving format",
      "No caffeine",
    ],
    variants: buildVariants(
      "liquid-carnitine",
      "LCL",
      [{ size: "1 L", weightGrams: 1250, priceCents: 2290, servings: 40 }],
      [
        { name: "Tropical Citrus", hex: "#ffb43a" },
        { name: "Cherry", hex: "#c2203f" },
      ],
      { "liquid-carnitine-cherry-1-l": 11 },
    ),
    defaultVariantId: "liquid-carnitine-tropical-citrus-1-l",
    ingredients:
      "Water, L-carnitine tartrate, acidity regulator (citric acid), flavouring, preservative (potassium sorbate), sweetener (sucralose), colour. Demo formulation, not a verified label.",
    nutrition: nutrition("1 serving (25 ml)", [
      ["Energy", "8 kJ / 2 kcal"],
      ["L-carnitine", "1,500 mg"],
    ]),
    servingNote:
      "Illustrative serving format: 25 ml per serving, 40 servings per 1 L bottle. The measuring cap on the render is an art-direction idea; confirm serving size and amounts against a verified label before selling.",
    directions:
      "Shake well. Measure 25 ml with the cap and add to 200 ml of water, or take straight. One serving per day. Refrigerate after opening and use within 8 weeks.",
    warnings: commonWarnings,
    related: ["carnitine-tablets", "caffeine", "bcaa", "multivitamin"],
    pack: {
      kind: "bottle",
      body: "charcoal",
      lines: ["L-CARNITINE", "LIQUID"],
      descriptor: "1 litre drink concentrate",
      accent: "#ffb43a",
      flavorDriven: true,
    },
    keywords: ["carnitine", "liquid", "l-carnitine", "bottle", "drink"],
    badges: [],
    addedAt: "2026-03-22",
    featuredRank: 10,
    bestSellerRank: 9,
  },
  {
    id: "caffeine",
    slug: "caffeine-tablets",
    title: "Caffeine Tablets",
    shortTitle: "Caffeine",
    categoryId: "carnitine-energy",
    goals: ["performance", "fat-burn"],
    tagline: "A measured dose of caffeine, no flavour, no sugar.",
    description: [
      "Caffeine Tablets give you a fixed amount of caffeine in a small tablet that you can keep in a gym bag. There is no taste, no sugar and no sweetener.",
      "Each tablet contains 200 mg of caffeine, which is a high dose. Read the warnings before you buy and count the caffeine you also get from coffee and pre-workout.",
    ],
    highlights: [
      "200 mg caffeine per tablet (demo spec)",
      "100 or 200 tablets",
      "Easy to divide into half doses",
      "Not for under 18s",
    ],
    variants: buildVariants("caffeine", "CAF", [
      { size: "100 tablets", weightGrams: 140, priceCents: 990, servings: 100 },
      { size: "200 tablets", weightGrams: 240, priceCents: 1690, compareAtCents: 1980, servings: 200 },
    ]),
    defaultVariantId: "caffeine-100-tablets",
    ingredients:
      "Caffeine anhydrous, bulking agent (microcrystalline cellulose), anti-caking agents (magnesium stearate, silicon dioxide). Demo formulation, not a verified label.",
    nutrition: nutrition("1 tablet", [
      ["Caffeine", "200 mg"],
      ["Energy", "0 kcal"],
    ]),
    directions: "Take one tablet with water before training. Do not take more than one tablet per day.",
    warnings: [
      "High caffeine content. Not recommended for children, pregnant or breast-feeding women.",
      "Do not combine with other caffeine-containing supplements or large amounts of coffee.",
      ...commonWarnings,
    ],
    related: ["pre-workout", "carnitine-tablets", "liquid-carnitine", "bcaa"],
    pack: {
      kind: "jar",
      body: "black",
      lines: ["CAFFEINE"],
      descriptor: "200 mg tablets",
      accent: "#ff5a1f",
    },
    keywords: ["caffeine", "tablets", "energy", "focus"],
    badges: [],
    addedAt: "2026-02-10",
    featuredRank: 11,
    bestSellerRank: 11,
  },
  {
    id: "omega-3",
    slug: "omega-3",
    title: "Omega-3",
    shortTitle: "Omega-3",
    categoryId: "daily-health",
    goals: ["health"],
    tagline: "Fish oil softgels, taken with a meal.",
    description: [
      "Omega-3 is a fish oil softgel that contains EPA and DHA. Take it with food and keep it in the cupboard, not the gym bag.",
      "As with all products in the demo catalog, the amounts shown are illustrative and must be replaced by verified label data before any real sale.",
    ],
    highlights: [
      "Fish oil softgels",
      "90 or 180 softgels",
      "Small, easy-to-swallow capsule",
      "No flavouring",
    ],
    variants: buildVariants("omega-3", "OMG", [
      { size: "90 softgels", weightGrams: 170, priceCents: 1790, servings: 45 },
      { size: "180 softgels", weightGrams: 300, priceCents: 2990, compareAtCents: 3580, servings: 90 },
    ]),
    defaultVariantId: "omega-3-90-softgels",
    ingredients:
      "Fish oil (anchovy, sardine, mackerel), softgel capsule (gelatin, glycerol, water), antioxidant (mixed tocopherols). Demo formulation, not a verified label.",
    allergens: "Contains fish.",
    nutrition: nutrition("2 softgels", [
      ["Fish oil", "2,000 mg"],
      ["EPA", "360 mg", true],
      ["DHA", "240 mg", true],
    ]),
    directions: "Take two softgels per day with a meal and a glass of water.",
    warnings: [
      "If you take blood-thinning medication, speak to a doctor before use.",
      ...commonWarnings,
    ],
    related: ["multivitamin", "creatine", "whey", "carnitine-tablets"],
    pack: {
      kind: "jar",
      body: "slate",
      lines: ["OMEGA-3"],
      descriptor: "Fish oil softgels",
      accent: "#4fb8c9",
    },
    keywords: ["omega", "omega3", "fish oil", "epa", "dha", "softgel"],
    badges: [],
    addedAt: "2026-02-14",
    featuredRank: 12,
    bestSellerRank: 10,
  },
  {
    id: "multivitamin",
    slug: "multivitamin",
    title: "Multivitamin",
    shortTitle: "Multivitamin",
    categoryId: "daily-health",
    goals: ["health"],
    tagline: "One tablet a day, in a bone-white jar.",
    description: [
      "Multivitamin is a once-a-day tablet with a broad range of vitamins and minerals in this demo specification.",
      "It does not replace food. It is there for the days when your diet is less varied than you would like.",
    ],
    highlights: [
      "One tablet per day",
      "60 or 120 tablets",
      "Vitamins and minerals",
      "Small, coated tablet",
    ],
    variants: buildVariants("multivitamin", "MUL", [
      { size: "60 tablets", weightGrams: 120, priceCents: 1490, servings: 60 },
      { size: "120 tablets", weightGrams: 210, priceCents: 2490, compareAtCents: 2980, servings: 120 },
    ]),
    defaultVariantId: "multivitamin-60-tablets",
    ingredients:
      "Bulking agent (microcrystalline cellulose), vitamin C, magnesium oxide, zinc citrate, vitamin E, niacin, vitamin B6, vitamin B12, folic acid, vitamin D3, coating (hydroxypropyl methylcellulose), anti-caking agent (magnesium stearate). Demo formulation, not a verified label.",
    nutrition: nutrition("1 tablet", [
      ["Vitamin C", "80 mg"],
      ["Vitamin D3", "25 µg"],
      ["Vitamin B12", "2.5 µg"],
      ["Zinc", "10 mg"],
      ["Magnesium", "56 mg"],
    ]),
    directions: "Take one tablet per day with a meal and a glass of water.",
    warnings: commonWarnings,
    related: ["omega-3", "eaa", "whey", "carnitine-tablets"],
    pack: {
      kind: "jar",
      body: "bone",
      lines: ["MULTI", "VITAMIN"],
      descriptor: "Daily tablets",
      accent: "#161615",
    },
    keywords: ["multivitamin", "vitamin", "minerals", "daily", "health"],
    badges: [],
    addedAt: "2026-02-14",
    featuredRank: 13,
    bestSellerRank: 12,
  },
  {
    id: "carnitine-tablets",
    slug: "l-carnitine-tablets",
    title: "L-Carnitine Tablets",
    shortTitle: "L-Carnitine Tablets",
    categoryId: "carnitine-energy",
    goals: ["fat-burn"],
    tagline: "The tablet format of L-carnitine, for people who do not want a bottle.",
    description: [
      "L-Carnitine Tablets are the tablet counterpart to our Liquid L-Carnitine. Same ingredient family, different format: a compact jar you can keep in a bag or desk drawer.",
      "Tablets are easier to carry; the liquid is easier to dose by volume. Pick whichever suits how you train.",
    ],
    highlights: [
      "Tablet format of L-carnitine",
      "120 or 240 tablets",
      "No flavour, no sugar",
      "Compact jar",
    ],
    variants: buildVariants("carnitine-tablets", "LCT", [
      { size: "120 tablets", weightGrams: 190, priceCents: 1890, servings: 40 },
      { size: "240 tablets", weightGrams: 340, priceCents: 3290, compareAtCents: 3780, servings: 80 },
    ]),
    defaultVariantId: "carnitine-tablets-120-tablets",
    ingredients:
      "L-carnitine tartrate, bulking agent (microcrystalline cellulose), anti-caking agents (magnesium stearate, silicon dioxide), coating (hydroxypropyl methylcellulose). Demo formulation, not a verified label.",
    nutrition: nutrition("3 tablets", [
      ["L-carnitine", "1,500 mg"],
      ["Energy", "0 kcal"],
    ]),
    directions: "Take three tablets per day with water, preferably with food.",
    warnings: commonWarnings,
    related: ["liquid-carnitine", "caffeine", "omega-3", "bcaa"],
    pack: {
      kind: "jar",
      body: "charcoal",
      lines: ["L-CARNITINE", "TABLETS"],
      descriptor: "Carnitine tablets",
      accent: "#e5ded0",
    },
    keywords: ["carnitine", "tablets", "l-carnitine", "tabs"],
    badges: [],
    addedAt: "2026-03-22",
    featuredRank: 14,
    bestSellerRank: 13,
  },
];

export const productCategories: CategoryId[] = [...new Set(products.map((p) => p.categoryId))];
