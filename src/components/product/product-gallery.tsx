"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import { useState } from "react";
import { productFlavors } from "@/domain/catalog";
import type { Product, Variant } from "@/domain/types";
import { PackShot } from "./pack-shot";

type SlideId = "front" | "campaign" | "detail" | "range";

function Slide({ id, product, variant }: { id: SlideId; product: Product; variant: Variant }) {
  const accent = variant.flavorHex ?? product.pack.accent;
  if (id === "front") {
    return <PackShot product={product} variant={variant} className="absolute inset-0 size-full p-[6%]" />;
  }
  if (id === "campaign") {
    return (
      <div className="absolute inset-0 overflow-hidden" style={{ background: `radial-gradient(120% 90% at 50% 100%, ${accent} 0%, #161615 62%, #0b0b0a 100%)` }}>
        <span aria-hidden className="display absolute inset-x-0 top-[8%] select-none text-center text-[clamp(5rem,17vw,13rem)] text-bone/[0.14]">
          {product.pack.lines[0]}
        </span>
        <PackShot product={product} variant={variant} className="absolute inset-0 size-full scale-90 translate-y-[4%]" />
      </div>
    );
  }
  if (id === "detail") {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <PackShot product={product} variant={variant} bare className="absolute inset-0 size-full origin-[50%_56%] scale-[2.15]" />
      </div>
    );
  }
  const items = productFlavors(product).length > 1 ? product.variants.filter((v, i, a) => a.findIndex((x) => x.flavor === v.flavor) === i) : [];
  const sizeItems = items.length ? [] : product.variants.filter((v, i, a) => a.findIndex((x) => x.size === v.size) === i);
  const lineup = items.length ? items : sizeItems;
  const maxWeight = Math.max(...lineup.map((v) => v.weightGrams));
  return (
    <div className="absolute inset-0 flex items-end justify-center gap-[1%] px-[4%] pb-[6%]">
      {lineup.slice(0, 4).map((v) => {
        const scale = items.length ? 1 : 0.62 + 0.38 * Math.sqrt(v.weightGrams / maxWeight);
        return (
          <div key={v.id} className="flex min-w-0 flex-1 flex-col items-center" style={{ transform: `scale(${scale})`, transformOrigin: "50% 100%" }}>
            <PackShot product={product} variant={v} className="aspect-[4/5] w-full" />
          </div>
        );
      })}
    </div>
  );
}

const labels: Record<SlideId, string> = {
  front: "Front of pack",
  campaign: "Campaign view",
  detail: "Label detail",
  range: "The range",
};

export function ProductGallery({ product, variant }: { product: Product; variant: Variant }) {
  const [index, setIndex] = useState(0);
  const slides: SlideId[] = ["front", "campaign", "detail", "range"];
  const go = (n: number) => setIndex((n + slides.length) % slides.length);

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse" role="region" aria-roledescription="carousel" aria-label={`${product.title} images`}>
      <div className="relative aspect-[4/5] flex-1 overflow-hidden bg-sand/70">
        {slides.map((id, i) => (
          <div
            key={id}
            aria-hidden={i !== index}
            className={clsx("absolute inset-0 transition-opacity duration-500 ease-out", i === index ? "opacity-100" : "pointer-events-none opacity-0")}
          >
            <Slide id={id} product={product} variant={variant} />
          </div>
        ))}
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
          <span className="eyebrow bg-bone/80 px-2 py-1 backdrop-blur">{labels[slides[index]]}</span>
          <div className="flex gap-1">
            <button type="button" onClick={() => go(index - 1)} aria-label="Previous image" className="inline-flex size-10 items-center justify-center bg-bone/85 backdrop-blur hover:bg-bone">
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button type="button" onClick={() => go(index + 1)} aria-label="Next image" className="inline-flex size-10 items-center justify-center bg-bone/85 backdrop-blur hover:bg-bone">
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </div>
        </div>
        <p className="sr-only" aria-live="polite">{labels[slides[index]]}, image {index + 1} of {slides.length}</p>
      </div>
      <ul className="flex gap-2 lg:w-20 lg:flex-col">
        {slides.map((id, i) => (
          <li key={id} className="flex-1 lg:flex-none">
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show ${labels[id].toLowerCase()}`}
              aria-current={i === index}
              className={clsx("relative block aspect-square w-full overflow-hidden bg-sand/70 outline-offset-2 transition-opacity lg:aspect-[4/5]", i === index ? "ring-2 ring-ink" : "opacity-60 hover:opacity-100")}
            >
              <div className="pointer-events-none absolute inset-0">
                <Slide id={id} product={product} variant={variant} />
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
