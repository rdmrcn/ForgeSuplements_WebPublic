import type { Metadata } from "next";
import { Breadcrumbs, PageHeader } from "@/components/layout/page-header";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = { title: "Cart", robots: { index: false, follow: false } };

export default function CartPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Cart" }]} />
      <PageHeader eyebrow="Review" title="Your cart" />
      <CartView />
    </>
  );
}
