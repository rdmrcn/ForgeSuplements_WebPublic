import { brand } from "@/config/brand";

const formatter = new Intl.NumberFormat(brand.currency.locale, {
  style: "currency",
  currency: brand.currency.code,
});

export function formatMoney(cents: number): string {
  return formatter.format(cents / 100);
}

export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    const kg = grams / 1000;
    return `${Number.isInteger(kg) ? kg : kg.toFixed(2).replace(/0+$/, "")} kg`;
  }
  return `${grams} g`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
