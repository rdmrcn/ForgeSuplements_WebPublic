import Image from "next/image";
import { brand } from "@/config/brand";
import { getProductById, products } from "@/domain/catalog";
import { LinkButton } from "@/components/ui/button";
import { PackShot } from "@/components/product/pack-shot";

export function Hero() {
  const whey = getProductById("whey")!;
  const isolate = getProductById("isolate")!;
  const creatine = getProductById("creatine")!;
  const pre = getProductById("pre-workout")!;
  const v = (p: typeof whey, id: string) => p.variants.find((x) => x.id === id);

  return (
    <section className="grain relative isolate overflow-hidden bg-ink text-bone" aria-labelledby="hero-heading" data-theme="dark">
      <Image
        src="/images/hero-gym.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover object-[72%_50%] opacity-80"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(11_11_10/0.96)_0%,rgb(11_11_10/0.7)_42%,rgb(11_11_10/0.15)_100%)]" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink to-transparent" />

      <div className="container-x grid min-h-[min(46rem,calc(100dvh-var(--header-h)-2.25rem))] items-center gap-6 py-12 lg:grid-cols-[1.05fr_1fr] lg:py-16">
        <div className="relative z-10">
          <p className="eyebrow flex items-center gap-3 text-ember" data-reveal>
            <span aria-hidden className="h-px w-8 bg-ember" /> Sports nutrition &middot; Demo collection
          </p>
          <h1 id="hero-heading" className="display mt-5 text-[clamp(4rem,12.5vw,10.5rem)]" data-reveal style={{ ["--i" as string]: 1 }}>
            Built
            <br />
            for the <span className="serif-italic text-ember">work.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-snug text-bone/80" data-reveal style={{ ["--i" as string]: 2 }}>
            Protein, creatine, pre-workout and daily essentials with short ingredient lists and plain labels. {brand.name} is a fictional brand,
            built here as a complete shopping experience.
          </p>
          <div className="mt-8 flex flex-wrap gap-3" data-reveal style={{ ["--i" as string]: 3 }}>
            <LinkButton href="/shop" variant="accent" size="lg">Shop all products</LinkButton>
            <LinkButton href="/shop/protein" variant="outline-inverse" size="lg">Shop protein</LinkButton>
          </div>
          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-bone/20 pt-5 text-sm" data-reveal style={{ ["--i" as string]: 4 }}>
            <div>
              <dt className="eyebrow text-bone/55">Range</dt>
              <dd className="display mt-1 text-3xl">{products.length} products</dd>
            </div>
            <div>
              <dt className="eyebrow text-bone/55">Ships to</dt>
              <dd className="display mt-1 text-3xl">6 countries</dd>
            </div>
            <div>
              <dt className="eyebrow text-bone/55">Checkout</dt>
              <dd className="display mt-1 text-3xl">Demo mode</dd>
            </div>
          </dl>
        </div>

        <div className="relative mx-auto mt-4 aspect-[5/4] w-full max-w-[40rem] lg:mt-0 lg:max-w-none" aria-hidden={false}>
          <div className="absolute bottom-[2%] left-[-1%] w-[43%] -rotate-[5deg] motion-safe:[animation:rise_1.2s_var(--ease-out-expo)_0.5s_both]">
            <div className="motion-safe:[animation:float-pack_7s_ease-in-out_infinite]">
              <PackShot product={isolate} variant={v(isolate, "isolate-vanilla-bean-750-g")} className="w-full drop-shadow-[0_30px_40px_rgb(0_0_0/0.55)]" bare />
            </div>
          </div>
          <div className="absolute bottom-[-3%] right-[-2%] w-[44%] rotate-[5deg] motion-safe:[animation:rise_1.2s_var(--ease-out-expo)_0.65s_both]">
            <div className="motion-safe:[animation:float-pack_8s_ease-in-out_-2s_infinite]">
              <PackShot product={creatine} variant={v(creatine, "creatine-600-g")} className="w-full drop-shadow-[0_30px_40px_rgb(0_0_0/0.55)]" bare />
            </div>
          </div>
          <div className="absolute inset-x-[25%] bottom-[-1%] z-10 motion-safe:[animation:rise_1.2s_var(--ease-out-expo)_0.35s_both]">
            <div className="motion-safe:[animation:float-pack_6s_ease-in-out_-1s_infinite]">
              <PackShot product={whey} variant={v(whey, "whey-dark-cocoa-2-kg")} className="w-full drop-shadow-[0_40px_50px_rgb(0_0_0/0.6)]" bare />
            </div>
          </div>
          <div className="absolute right-[24%] top-[-6%] z-0 hidden w-[24%] rotate-[10deg] opacity-90 motion-safe:[animation:rise_1.2s_var(--ease-out-expo)_0.8s_both] sm:block">
            <PackShot product={pre} variant={v(pre, "pre-workout-raspberry-450-g")} className="w-full drop-shadow-[0_20px_30px_rgb(0_0_0/0.5)]" bare />
          </div>
        </div>
      </div>
    </section>
  );
}
