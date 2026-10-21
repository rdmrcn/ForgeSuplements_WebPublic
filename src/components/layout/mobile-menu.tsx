"use client";

import { ChevronRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { categories } from "@/domain/catalog";
import { Drawer } from "@/components/ui/drawer";
import { Logo } from "@/components/ui/logo";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const row = "flex items-center justify-between border-b border-line py-4";

  return (
    <>
      <button
        type="button"
        className="-ml-2 inline-flex size-11 items-center justify-center hover:bg-ink/6 lg:hidden"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu className="size-6" aria-hidden />
      </button>
      <Drawer open={open} onClose={close} side="left" label="Menu" className="flex w-[min(24rem,92vw)] flex-col overflow-y-auto bg-bone">
        <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-line px-5">
          <Logo />
          <button type="button" onClick={close} aria-label="Close menu" className="inline-flex size-11 items-center justify-center hover:bg-ink/6">
            <X className="size-6" aria-hidden />
          </button>
        </div>
        <nav aria-label="Mobile" className="px-5 py-2">
          <Link href="/shop" onClick={close} className={`${row} display text-3xl`}>
            Shop all <ChevronRight className="size-5" aria-hidden />
          </Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/shop/${c.slug}`} onClick={close} className={`${row} text-lg font-medium`}>
              {c.name} <ChevronRight className="size-4 text-stone" aria-hidden />
            </Link>
          ))}
          <div className="grid gap-1 pt-5 text-sm">
            <Link href="/favorites" onClick={close} className="py-2">Favourites</Link>
            <Link href="/about" onClick={close} className="py-2">About</Link>
            <Link href="/contact" onClick={close} className="py-2">Contact and support</Link>
            <Link href="/policies/shipping" onClick={close} className="py-2">Shipping and delivery</Link>
          </div>
        </nav>
      </Drawer>
    </>
  );
}
