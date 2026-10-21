"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Product, Variant } from "@/domain/types";
import { formatMoney } from "@/lib/format";
import { useCartStore } from "@/store/cart";
import { toast } from "@/store/toast";

export function useAddToCart(product: Product) {
  const add = useCartStore((s) => s.add);
  return (variant: Variant, quantity = 1) => {
    const result = add(variant.id, quantity);
    const label = [product.title, variant.flavor, variant.size].filter(Boolean).join(", ");
    if (result.ok) {
      toast.success(
        result.capped ? `Added ${result.added} of ${label}. That is the maximum available.` : `${label} added to your cart.`,
        { label: "View cart", href: "/cart" },
      );
    } else {
      toast.error(result.reason);
    }
    return result.ok;
  };
}

export function AddToCartButton({
  product,
  variant,
  quantity = 1,
  size = "lg",
  full = true,
  showPrice,
}: {
  product: Product;
  variant: Variant;
  quantity?: number;
  size?: "sm" | "md" | "lg";
  full?: boolean;
  showPrice?: boolean;
}) {
  const addToCart = useAddToCart(product);
  const [justAdded, setJustAdded] = useState(false);
  const soldOut = variant.stock <= 0;

  return (
    <Button
      variant="accent"
      size={size}
      full={full}
      disabled={soldOut}
      data-testid="add-to-cart"
      onClick={() => {
        if (addToCart(variant, quantity)) {
          setJustAdded(true);
          window.setTimeout(() => setJustAdded(false), 1600);
        }
      }}
    >
      {soldOut ? (
        "Sold out"
      ) : justAdded ? (
        <>
          <Check className="size-4" aria-hidden /> Added
        </>
      ) : (
        <>Add to cart{showPrice && <span aria-hidden> &middot; {formatMoney(variant.priceCents * quantity)}</span>}</>
      )}
    </Button>
  );
}
