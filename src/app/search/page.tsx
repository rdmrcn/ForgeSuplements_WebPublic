import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/layout/page-header";
import { BrowserSkeleton } from "@/components/shop/browser-skeleton";
import { ProductBrowser } from "@/components/shop/product-browser";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the FORGE demo catalog by product, flavour or size.",
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Search" }]} />
      <div className="pt-4">
        <Suspense fallback={<BrowserSkeleton />}>
          <ProductBrowser showSearch />
        </Suspense>
      </div>
    </>
  );
}
