import type { Metadata } from "next";
import Image from "next/image";
import { brand } from "@/config/brand";
import { Breadcrumbs, PageHeader } from "@/components/layout/page-header";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description: `The idea behind ${brand.name}: a fictional, restrained sports nutrition brand built as a complete e-commerce demo.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "About" }]} />
      <PageHeader eyebrow="About the brand" title={<>Less noise. <span className="serif-italic">More training.</span></>} />
      <div className="container-x grid gap-12 pb-16 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div className="relative aspect-[4/5] overflow-hidden bg-ink">
          <Image src="/images/hero-gym.jpg" alt="A barbell on a dark gym floor with chalk dust hanging in the air under a single light." fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover object-[75%_50%]" />
        </div>
        <div className="prose-forge text-lg">
          <p>{brand.name} is a fictional sports nutrition brand. It exists to show what a premium, restrained direct-to-consumer storefront can look and feel like, from the typography on the tub to the way the cart handles two flavours of the same product.</p>
          <p>The thinking is simple. A label should say what is inside. A product page should answer the questions you actually have. A checkout should tell you the shipping cost before you commit, and it should be clear when something is only a demo.</p>
          <h2>What is real and what is not</h2>
          <p>The software is real: the catalog model, variant-aware cart, country-specific checkout, shipping calculation and demo order flow all work. The business is not. Products, prices, formulations, nutrition values, stock and delivery times are invented, and the brand name is provisional and not trademark-cleared.</p>
          <h2>How we would make it real</h2>
          <ul>
            <li>Verified formulations and label data reviewed per market.</li>
            <li>Accredited third-party batch testing, with certificates published.</li>
            <li>A hosted payment provider, a production database and live carrier rates.</li>
            <li>Reviewed legal policies for every country served.</li>
          </ul>
          <div className="mt-8 flex gap-3">
            <LinkButton href="/shop">Shop the range</LinkButton>
            <LinkButton href="/contact" variant="outline">Contact</LinkButton>
          </div>
        </div>
      </div>
    </>
  );
}
