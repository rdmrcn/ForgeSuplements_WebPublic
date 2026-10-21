import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { shippingCountries } from "@/config/shipping";
import { describeEta } from "@/domain/shipping";
import { getVariant } from "@/domain/catalog";
import { formatMoney } from "@/lib/format";
import { PackShot } from "@/components/product/pack-shot";
import { LinkButton } from "@/components/ui/button";
import { getOrderRepository } from "@/server/orders";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Demo order confirmation", robots: { index: false, follow: false } };

export default async function OrderPage({ params }: PageProps<"/order/[id]">) {
  const { id } = await params;
  if (!/^FRG-DEMO-[A-Z0-9]{10}$/.test(id)) notFound();
  const order = await getOrderRepository().get(id);
  if (!order) notFound();

  const a = order.shippingAddress;
  const date = new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "UTC" }).format(new Date(order.createdAt));

  return (
    <div className="container-x py-10 sm:py-16">
      <div className="border-2 border-ink bg-ember p-5 sm:p-8" role="status" data-testid="demo-order-banner">
        <p className="eyebrow">Demo order &middot; not a real purchase</p>
        <h1 className="display mt-2 text-[clamp(3rem,9vw,7.5rem)]">Demo order created</h1>
        <p className="mt-3 max-w-2xl text-lg">
          This order was saved locally for demonstration. <strong data-testid="payment-status">Payment status: unpaid (demo)</strong>. No money was charged, no courier was booked and nothing will be shipped.
        </p>
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="items-heading">
          <p className="eyebrow text-stone">Order number</p>
          <p className="display mt-1 text-4xl" data-testid="order-id">{order.id}</p>
          <p className="mt-1 text-sm text-stone">{date} UTC</p>

          <h2 id="items-heading" className="display mt-10 text-3xl">Items</h2>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {order.lines.map((l) => {
              const entry = getVariant(l.variantId);
              return (
                <li key={l.variantId} className="flex gap-4 py-4">
                  <span className="relative block size-20 shrink-0 overflow-hidden bg-sand">
                    {entry && <PackShot product={entry.product} variant={entry.variant} bare className="absolute inset-0 size-full scale-125" />}
                  </span>
                  <div className="flex-1">
                    <p className="display text-xl">{l.productTitle}</p>
                    <p className="text-sm text-stone">{l.variantLabel} &middot; Qty {l.quantity}</p>
                  </div>
                  <p className="font-semibold tabular-nums">{formatMoney(l.lineTotalCents)}</p>
                </li>
              );
            })}
          </ul>

          <dl className="mt-6 max-w-sm space-y-2 text-sm ml-auto">
            <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{formatMoney(order.pricing.subtotalCents)}</dd></div>
            {order.pricing.discountCents > 0 && (
              <div className="flex justify-between text-ok"><dt>Discount ({order.pricing.discountCode})</dt><dd className="tabular-nums">-{formatMoney(order.pricing.discountCents)}</dd></div>
            )}
            <div className="flex justify-between"><dt>Shipping (illustrative)</dt><dd className="tabular-nums">{order.pricing.shippingCents === 0 ? "Free" : formatMoney(order.pricing.shippingCents)}</dd></div>
            <div className="flex justify-between border-t border-line-strong pt-3 text-base font-semibold"><dt>Total (not charged)</dt><dd className="text-lg tabular-nums">{formatMoney(order.pricing.totalCents)}</dd></div>
          </dl>
        </section>

        <aside className="space-y-8" aria-label="Order details">
          <div>
            <h2 className="display text-3xl">Delivery</h2>
            <address className="mt-3 text-sm not-italic leading-relaxed">
              {a.firstName} {a.lastName}<br />
              {[a.address1, a.houseNumber].filter(Boolean).join(" ")}<br />
              {a.address2 && <>{a.address2}<br /></>}
              {[a.postalCode, a.city].filter(Boolean).join(" ")}{a.region ? `, ${a.region}` : ""}<br />
              {shippingCountries[order.shipping.country].name}
            </address>
            <p className="mt-3 text-sm text-stone">
              {order.shipping.label}, estimated {describeEta(order.shipping.etaBusinessDays)} (illustrative, not a courier promise).
            </p>
          </div>
          <div>
            <h2 className="display text-3xl">Contact</h2>
            <p className="mt-3 text-sm">{order.customer.email}<br />{order.customer.phone}</p>
            <p className="mt-2 text-xs text-stone">No confirmation email is sent in this demo.</p>
          </div>
          <div className="border border-line p-4 text-sm text-ink/80">
            <p className="font-semibold">What happens next</p>
            <p className="mt-1">Nothing. This is a portfolio demo, so there is no fulfilment, payment or tracking. In a live store this is where the payment provider would confirm payment and a confirmation email would be sent.</p>
          </div>
          <LinkButton href="/shop" variant="primary">Keep browsing</LinkButton>
        </aside>
      </div>
    </div>
  );
}
