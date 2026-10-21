import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/page-header";
import { CheckoutView } from "@/components/checkout/checkout-view";

export const metadata: Metadata = { title: "Checkout (demo)", robots: { index: false, follow: false } };

export default function CheckoutPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <CheckoutView />
    </>
  );
}
