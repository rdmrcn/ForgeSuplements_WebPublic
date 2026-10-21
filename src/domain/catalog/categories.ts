import type { Category, CategoryId } from "../types";

export const categories: Category[] = [
  {
    id: "protein",
    slug: "protein",
    name: "Protein",
    blurb: "Whey, whey isolate and slow-release casein.",
    tone: "dark",
  },
  {
    id: "creatine",
    slug: "creatine",
    name: "Creatine",
    blurb: "Creatine monohydrate, nothing else in the tub.",
    tone: "light",
  },
  {
    id: "pre-workout",
    slug: "pre-workout",
    name: "Pre-Workout",
    blurb: "Three flavours, one clear formula.",
    tone: "ember",
  },
  {
    id: "amino-acids",
    slug: "amino-acids",
    name: "Amino Acids",
    blurb: "BCAA and EAA powders for training sessions.",
    tone: "dark",
  },
  {
    id: "mass-gainers",
    slug: "mass-gainers",
    name: "Mass Gainers",
    blurb: "High-calorie powders in three bag sizes.",
    tone: "light",
  },
  {
    id: "carnitine-energy",
    slug: "carnitine-energy",
    name: "Carnitine & Energy",
    blurb: "Liquid and tablet L-carnitine, plus caffeine tablets.",
    tone: "dark",
  },
  {
    id: "daily-health",
    slug: "daily-health",
    name: "Daily Health",
    blurb: "Omega-3 and a daily multivitamin.",
    tone: "light",
  },
];

export function getCategory(idOrSlug: string): Category | undefined {
  return categories.find((c) => c.id === idOrSlug || c.slug === idOrSlug);
}

export function categoryName(id: CategoryId): string {
  return getCategory(id)?.name ?? id;
}
