import type { MetadataRoute } from "next";
import { brand } from "@/config/brand";
import { categories, products } from "@/domain/catalog";
import { policies } from "@/content/policies";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = brand.siteUrl.replace(/\/$/, "");
  const entry = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({ url: `${base}${path}`, priority });
  return [
    entry("/", 1),
    entry("/shop", 0.9),
    ...categories.map((c) => entry(`/shop/${c.slug}`, 0.8)),
    ...products.map((p) => entry(`/products/${p.slug}`, 0.8)),
    entry("/about", 0.5),
    entry("/contact", 0.5),
    ...policies.map((p) => entry(`/policies/${p.slug}`, 0.3)),
  ];
}
