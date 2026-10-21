import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brand } from "@/config/brand";
import { getProductBySlug, getRelatedProducts, products } from "@/domain/catalog";
import { categoryName, getCategory } from "@/domain/catalog/categories";
import { Breadcrumbs } from "@/components/layout/page-header";
import { NutritionTable } from "@/components/product/nutrition-table";
import { ProductCard } from "@/components/product/product-card";
import { ProductHero } from "@/components/product/product-hero";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { Accordion } from "@/components/ui/accordion";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  const description = `${product.tagline} ${product.description[0]}`.slice(0, 200);
  return {
    title: product.title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title: `${product.title} | ${brand.name}`, description, type: "website", url: `/products/${product.slug}` },
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelatedProducts(product);
  const category = getCategory(product.categoryId);

  // Only fields that exist in the catalog are published. No ratings, reviews or certifications.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description[0],
    sku: product.variants[0].sku,
    brand: { "@type": "Brand", name: brand.name },
    category: categoryName(product.categoryId),
    offers: product.variants.map((v) => ({
      "@type": "Offer",
      sku: v.sku,
      name: [v.flavor, v.size].filter(Boolean).join(" / "),
      price: (v.priceCents / 100).toFixed(2),
      priceCurrency: brand.currency.code,
      availability: v.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${brand.siteUrl}/products/${product.slug}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, { label: category?.name ?? "", href: `/shop/${category?.slug}` }, { label: product.title }]} />
      <ProductHero product={product} />

      <section className="container-x pb-16" aria-label="Product information">
        <div className="grid gap-x-16 lg:grid-cols-[1fr_1.3fr]">
          <div className="mb-8 lg:mb-0">
            <p className="eyebrow text-stone">Details</p>
            <h2 className="display mt-2 text-[clamp(2.5rem,5vw,4rem)]">What is in the tub</h2>
            <p className="mt-4 max-w-sm text-sm text-stone">
              All product data in this demo is illustrative. Formulations, amounts and warnings must be verified before real sale.
            </p>
          </div>
          <div className="border-t border-line">
            <Accordion title="Description" defaultOpen>
              <div className="space-y-3">
                {product.description.map((d) => (
                  <p key={d}>{d}</p>
                ))}
                {product.servingNote && <p className="border-l-2 border-ember pl-3 text-sm">{product.servingNote}</p>}
              </div>
            </Accordion>
            <Accordion title="Ingredients">
              <p>{product.ingredients}</p>
              {product.allergens && <p className="mt-3 font-medium">{product.allergens}</p>}
            </Accordion>
            <Accordion title="Nutrition information">
              <NutritionTable nutrition={product.nutrition} />
            </Accordion>
            <Accordion title="Directions for use">
              <p>{product.directions}</p>
            </Accordion>
            <Accordion title="Warnings">
              <ul className="list-disc space-y-1.5 pl-5">
                {product.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </Accordion>
          </div>
        </div>
      </section>

      <section className="border-t border-line py-14" aria-labelledby="related-heading">
        <div className="container-x">
          <h2 id="related-heading" className="display mb-8 text-[clamp(2.25rem,4.5vw,3.5rem)]">Pairs well with</h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>
      <RecentlyViewed excludeId={product.id} />
    </>
  );
}
