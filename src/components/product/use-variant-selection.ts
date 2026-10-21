"use client";

import { useMemo, useState } from "react";
import { defaultVariant, productFlavors, productSizes } from "@/domain/catalog";
import type { Product, Variant } from "@/domain/types";

export function useVariantSelection(product: Product, initial?: Variant) {
  const start = initial ?? defaultVariant(product);
  const [flavor, setFlavor] = useState<string | undefined>(start.flavor);
  const [size, setSize] = useState<string>(start.size);

  const flavors = useMemo(() => productFlavors(product), [product]);
  const sizes = useMemo(() => productSizes(product), [product]);

  const variant = useMemo(
    () =>
      product.variants.find((v) => v.size === size && v.flavor === flavor) ??
      product.variants.find((v) => v.flavor === flavor) ??
      product.variants.find((v) => v.size === size) ??
      product.variants[0],
    [product, flavor, size],
  );

  const stockFor = (f: string | undefined, s: string) =>
    product.variants.find((v) => v.flavor === f && v.size === s)?.stock ?? 0;

  return { variant, flavor, size, setFlavor, setSize, flavors, sizes, stockFor };
}
