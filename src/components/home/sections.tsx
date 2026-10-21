import Image from "next/image";
import Link from "next/link";
import { getBestSellers, getFeatured } from "@/domain/catalog";
import { LinkButton } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";

export function FeaturedProducts() {
  const items = getFeatured(4);
  return (
    <section className="container-x pb-20 sm:pb-28" aria-labelledby="featured-heading">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-stone">Featured</p>
          <h2 id="featured-heading" className="display mt-2 text-[clamp(2.75rem,7vw,6rem)]">
            Start <span className="serif-italic">here</span>
          </h2>
        </div>
        <Link href="/shop" className="link-underline text-sm font-semibold uppercase tracking-wider">Shop all</Link>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
        {items.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}

export function BrandStory() {
  const principles = [
    ["Plain labels", "Name, flavour, size. The front of the pack says what is inside and nothing else."],
    ["Short ingredient lists", "If an ingredient does not do a job, it does not go in."],
    ["Honest claims", "No miracle language and no borrowed science. We would rather say less."],
  ];
  return (
    <section className="bg-sand/60 py-20 sm:py-28" aria-labelledby="story-heading">
      <div className="container-x grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <div className="relative aspect-[4/5] overflow-hidden bg-ink lg:aspect-[5/6]">
          <Image src="/images/story-hands.jpg" alt="Chalked hands gripping a steel barbell against a black background." fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover object-[35%_50%]" />
          <p className="eyebrow absolute bottom-4 left-4 bg-bone px-2 py-1 text-ink">Training, not theatre</p>
        </div>
        <div>
          <p className="eyebrow text-stone">The brand</p>
          <h2 id="story-heading" className="display mt-2 text-[clamp(2.75rem,6.5vw,5.5rem)]">
            Made for people who <span className="serif-italic">train on purpose.</span>
          </h2>
          <p className="mt-6 max-w-lg text-lg text-ink/75">
            FORGE started as a design exercise: what would a sports nutrition brand look like if it was built around restraint? Strong typography, honest packaging and a store that gets out of your way.
          </p>
          <ul className="mt-10 divide-y divide-line border-y border-line">
            {principles.map(([title, text], i) => (
              <li key={title} className="grid grid-cols-[3rem_1fr] gap-2 py-5">
                <span className="eyebrow pt-1.5 text-stone">0{i + 1}</span>
                <div>
                  <h3 className="display text-2xl">{title}</h3>
                  <p className="mt-1 text-ink/70">{text}</p>
                </div>
              </li>
            ))}
          </ul>
          <LinkButton href="/about" variant="outline" className="mt-8">About the brand</LinkButton>
        </div>
      </div>
    </section>
  );
}

export function BestSellers() {
  const items = getBestSellers(4);
  return (
    <section className="bg-ink py-20 text-bone sm:py-28" aria-labelledby="best-heading" data-theme="dark">
      <div className="container-x">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-ember">Best sellers</p>
            <h2 id="best-heading" className="display mt-2 text-[clamp(2.75rem,7vw,6rem)]">The short list</h2>
            <p className="mt-3 text-sm text-bone/60">Ranking is illustrative demo data, not real sales.</p>
          </div>
          <Link href="/shop?sort=featured" className="link-underline text-sm font-semibold uppercase tracking-wider">Shop all</Link>
        </div>
        <ol className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
          {items.map((p, i) => (
            <li key={p.id}>
              <span aria-hidden className="display mb-2 block text-6xl leading-none text-ember">0{i + 1}</span>
              <ProductCard product={p} index={i} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Standards() {
  const items = [
    ["Label-first formulation", "Every demo product is specified from the label backwards: amounts per serving, directions and warnings are written before anything is described."],
    ["Allergens in plain sight", "Milk, fish, soy and cereals are called out on each product page rather than buried in small print."],
    ["Third-party testing", "Not claimed. A real launch would need batch testing by an accredited lab, and certificates published here."],
    ["Transparent shipping", "Rates and delivery times are shown before you place a demo order, and clearly marked as illustrative."],
  ];
  return (
    <section className="container-x py-20 sm:py-28" aria-labelledby="standards-heading">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <p className="eyebrow text-stone">Standards</p>
          <h2 id="standards-heading" className="display mt-2 text-[clamp(2.75rem,6vw,5rem)]">What we hold ourselves to</h2>
          <p className="mt-5 max-w-md text-ink/70">
            No fabricated badges, no invented lab results. These are the working standards behind the demo catalog, and what it would take to make them real.
          </p>
          <div className="relative mt-8 aspect-[16/10] overflow-hidden bg-ink">
            <Image src="/images/standards-powder.jpg" alt="Fine white powder poured into a smooth mound on a matte black surface." fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          </div>
        </div>
        <ul className="divide-y divide-line border-y border-line self-start">
          {items.map(([title, text], i) => (
            <li key={title} className="grid grid-cols-[3rem_1fr] gap-2 py-6">
              <span className="display text-3xl text-ember">0{i + 1}</span>
              <div>
                <h3 className="display text-2xl">{title}</h3>
                <p className="mt-1.5 text-ink/70">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function DeliveryBand() {
  const countries = ["Türkiye", "United States", "Canada", "Germany", "Austria", "United Kingdom"];
  return (
    <section className="border-y border-line bg-sand/50" aria-label="Delivery destinations">
      <div className="container-x flex flex-wrap items-center justify-between gap-x-10 gap-y-3 py-6">
        <p className="eyebrow">Demo delivery destinations</p>
        <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm font-medium">
          {countries.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <Link href="/policies/shipping" className="link-underline text-sm font-semibold uppercase tracking-wider">Shipping policy</Link>
      </div>
    </section>
  );
}
