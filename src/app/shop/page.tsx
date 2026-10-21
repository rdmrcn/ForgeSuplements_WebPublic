import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs, PageHeader } from "@/components/layout/page-header";
import { BrowserSkeleton } from "@/components/shop/browser-skeleton";
import { ProductBrowser } from "@/components/shop/product-browser";

export const metadata: Metadata = {
  title: "Shop all",
  description: "Browse the full FORGE demo range: protein, creatine, pre-workout, amino acids, mass gainers, carnitine and daily health.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Shop" }]} />
      <PageHeader eyebrow="The full range" title="Shop all" description="Thirteen products, every one with its own formulation, pack and size options. Filter by category, flavour, size or price." />
      <Suspense fallback={<BrowserSkeleton />}>
        <ProductBrowser />
      </Suspense>
    </>
  );
}
