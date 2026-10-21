import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs, PageHeader } from "@/components/layout/page-header";
import { BrowserSkeleton } from "@/components/shop/browser-skeleton";
import { ProductBrowser } from "@/components/shop/product-browser";
import { categories, getCategory } from "@/domain/catalog";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[category]">): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) return {};
  return {
    title: cat.name,
    description: `${cat.blurb} Shop ${cat.name.toLowerCase()} from the FORGE demo range.`,
    alternates: { canonical: `/shop/${cat.slug}` },
  };
}

export default async function CategoryPage({ params }: PageProps<"/shop/[category]">) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();

  return (
    <>
      <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, { label: cat.name }]} />
      <PageHeader eyebrow="Category" title={cat.name} description={cat.blurb} />
      <Suspense fallback={<BrowserSkeleton />}>
        <ProductBrowser lockedCategory={cat.id} />
      </Suspense>
    </>
  );
}
