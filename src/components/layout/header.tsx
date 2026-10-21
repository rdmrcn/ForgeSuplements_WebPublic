import Link from "next/link";
import { primaryNav } from "@/config/navigation";
import { categories, getProductsByCategory, goals } from "@/domain/catalog";
import { PackShot } from "@/components/product/pack-shot";
import { Logo } from "@/components/ui/logo";
import { HeaderActions } from "./header-actions";
import { MobileMenu } from "./mobile-menu";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bone/92 backdrop-blur-md">
      <div className="container-x flex h-[var(--header-h)] items-center gap-4">
        <MobileMenu />
        <Link href="/" className="shrink-0 rounded-xs" aria-label="FORGE home">
          <Logo />
        </Link>

        <nav aria-label="Main" className="ml-8 hidden flex-1 items-center gap-1 lg:flex">
          <div className="group">
            <Link
              href="/shop"
              className="flex h-[var(--header-h)] items-center px-3 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] hover:text-ember"
            >
              Shop
            </Link>
            <div className="invisible absolute inset-x-0 top-full -translate-y-1 border-b border-line bg-bone opacity-0 shadow-[var(--shadow-soft)] transition-[opacity,transform,visibility] duration-300 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <div className="container-x flex flex-wrap items-center gap-2 border-b border-line pt-5 pb-4">
                <span className="eyebrow mr-2 text-stone">Shop by goal</span>
                {goals.map((g) => (
                  <Link key={g.id} href={`/shop?goal=${g.id}`} className="border border-line-strong px-3 py-1.5 text-sm font-medium hover:border-ink hover:bg-ink hover:text-bone">
                    {g.name}
                  </Link>
                ))}
              </div>
              <div className="container-x grid grid-cols-7 gap-3 py-6">
                {categories.map((c) => {
                  const product = getProductsByCategory(c.id)[0];
                  return (
                    <Link key={c.id} href={`/shop/${c.slug}`} className="group/cat flex flex-col gap-2">
                      <span className="relative block aspect-[4/5] overflow-hidden bg-sand/70">
                        <PackShot
                          product={product}
                          className="absolute inset-0 size-full scale-110 transition-transform duration-500 ease-out group-hover/cat:scale-[1.17]"
                        />
                      </span>
                      <span className="display text-xl leading-none">{c.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex h-[var(--header-h)] items-center px-3 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] hover:text-ember"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <HeaderActions />
      </div>
    </header>
  );
}
