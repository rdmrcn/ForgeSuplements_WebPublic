import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs, PageHeader } from "@/components/layout/page-header";
import { BrowserSkeleton } from "@/components/shop/browser-skeleton";
import { ProductBrowser } from "@/components/shop/product-browser";

export const metadata: Metadata = {
  title: "Shop all",
  description: "Browse the full FORGE demo range by goal: muscle gain, mass gain, fat burn, performance and health.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Shop" }]} />
      <PageHeader eyebrow="The full range" title="Shop all" description="Pick a goal (muscle gain, mass gain, fat burn, performance or health), then narrow by product type, flavour, size or price." />
      <Suspense fallback={<BrowserSkeleton />}>
        <ProductBrowser />
      </Suspense>
    </>
  );
}
