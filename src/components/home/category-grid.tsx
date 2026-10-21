import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { clsx } from "clsx";
import { categories, getProductsByCategory } from "@/domain/catalog";
import { PackShot } from "@/components/product/pack-shot";
import type { Category } from "@/domain/types";

const placement: Record<string, string> = {
  protein: "sm:col-span-2 sm:row-span-2",
  "carnitine-energy": "sm:col-span-2",
  "daily-health": "sm:col-span-2",
};

const tones: Record<Category["tone"], string> = {
  dark: "bg-charcoal text-bone",
  light: "bg-sand text-ink",
  ember: "bg-ember text-ink",
};

export function CategoryGrid() {
  return (
    <section className="container-x py-20 sm:py-28" aria-labelledby="cat-heading">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-stone">Shop by category</p>
          <h2 id="cat-heading" className="display mt-2 text-[clamp(2.75rem,7vw,6rem)]">Pick your lane</h2>
        </div>
        <Link href="/shop" className="link-underline text-sm font-semibold uppercase tracking-wider">View everything</Link>
      </div>
      <div className="grid auto-rows-[minmax(15rem,auto)] gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[17rem]">
        {categories.map((c) => {
          const items = getProductsByCategory(c.id);
          const big = c.id === "protein";
          return (
            <Link
              key={c.id}
              href={`/shop/${c.slug}`}
              className={clsx("group relative isolate flex flex-col justify-between overflow-hidden p-5 sm:p-6", tones[c.tone], placement[c.id])}
            >
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <h3 className={clsx("display", big ? "text-[clamp(3rem,6vw,5.5rem)]" : "text-4xl sm:text-5xl")}>{c.name}</h3>
                  <p className={clsx("mt-2 text-sm opacity-75", big || c.id === "carnitine-energy" || c.id === "daily-health" ? "max-w-[16rem]" : "max-w-[55%]")}>{c.blurb}</p>
                </div>
                <ArrowUpRight className="size-6 shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden />
              </div>
              <div aria-hidden className={clsx("pointer-events-none absolute flex items-end justify-end", big ? "-bottom-[8%] right-[-2%] w-[62%]" : "-bottom-[14%] right-[-4%] w-[46%] min-w-40 max-w-60")}>
                {items.slice(0, big ? 2 : 1).map((p, i) => (
                  <PackShot
                    key={p.id}
                    product={p}
                    bare
                    className={clsx("w-full transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-translate-y-2", i === 1 && "-ml-[26%] mb-[-4%] scale-90")}
                  />
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
