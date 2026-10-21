import Link from "next/link";
import type { ReactNode } from "react";
import { brand } from "@/config/brand";
import { countryList } from "@/config/shipping";
import { PARCEL_OVERHEAD_GRAMS } from "@/config/shipping";
import { describeEta } from "@/domain/shipping";
import { formatMoney } from "@/lib/format";

export interface Policy {
  slug: string;
  title: string;
  description: string;
  updated: string;
  body: () => ReactNode;
}

const demoNote = (
  <p className="mb-8 border border-ember/60 bg-ember/10 p-4 text-sm">
    <strong>Demo policy.</strong> This text is placeholder content written for a portfolio project. It is not legal advice and is not a binding agreement. A real store needs
    policies reviewed by a qualified professional for each market it sells into.
  </p>
);

function ShippingTable() {
  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <caption className="mb-2 text-left text-xs text-stone">Illustrative demo rates generated from src/config/shipping.ts</caption>
        <thead>
          <tr className="border-b border-line-strong">
            <th scope="col" className="py-2 pr-4 font-semibold">Destination</th>
            <th scope="col" className="py-2 pr-4 font-semibold">Standard</th>
            <th scope="col" className="py-2 pr-4 font-semibold">Express</th>
            <th scope="col" className="py-2 font-semibold">Free standard from</th>
          </tr>
        </thead>
        <tbody>
          {countryList.map((c) => {
            const std = c.methods.find((m) => m.id === "standard")!;
            const exp = c.methods.find((m) => m.id === "express")!;
            return (
              <tr key={c.code} className="border-b border-line align-top">
                <th scope="row" className="py-3 pr-4 font-medium">{c.name}</th>
                <td className="py-3 pr-4">{formatMoney(std.baseCents)}<span className="block text-xs text-stone">{describeEta(std.etaBusinessDays)}</span></td>
                <td className="py-3 pr-4">{formatMoney(exp.baseCents)}<span className="block text-xs text-stone">{describeEta(exp.etaBusinessDays)}</span></td>
                <td className="py-3">{std.freeOverCents ? formatMoney(std.freeOverCents) : "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export const policies: Policy[] = [
  {
    slug: "shipping",
    title: "Shipping and delivery",
    description: "Illustrative demo shipping rates, delivery estimates and import notes for the FORGE demo store.",
    updated: "21 October 2026",
    body: () => (
      <>
        {demoNote}
        <h2>No real shipments</h2>
        <p>{brand.name} is a demo store. Orders placed here are not paid, not fulfilled and never shipped. Everything below describes how a real store built on this codebase would present shipping, using placeholder numbers.</p>
        <h2>Illustrative rates</h2>
        <p>
          Each destination has a base rate for standard and express delivery. Parcels heavier than the included weight add a per-kilogram supplement; the parcel weight is the sum of the products plus {PARCEL_OVERHEAD_GRAMS} g of packaging. Standard delivery becomes free when the order subtotal after discounts reaches the threshold shown.
        </p>
        <ShippingTable />
        <p>Rates and delivery estimates are demo values. They are not live carrier quotes and they do not include customs, import duties, VAT or other taxes.</p>
        <h2>Destinations</h2>
        <ul>
          {countryList.map((c) => (
            <li key={c.code}><strong>{c.name}</strong>: {c.notices.join(" ")}</li>
          ))}
        </ul>
        <h2>Supplement import rules</h2>
        <p>Food supplements, and some individual ingredients such as caffeine, creatine or L-carnitine, are regulated differently in each country. Availability in a destination is not guaranteed. Before selling for real, every product must be checked against the rules of every market it ships to, including labelling, permitted amounts and customs treatment.</p>
        <h2>Future carrier integrations</h2>
        <p>Rates come from a central configuration file. The code includes a carrier adapter interface so live quotes from a courier API can be added later without changing the checkout.</p>
      </>
    ),
  },
  {
    slug: "returns",
    title: "Returns and refunds",
    description: "Demo returns and refund policy for the FORGE demo store.",
    updated: "21 October 2026",
    body: () => (
      <>
        {demoNote}
        <h2>Demo orders</h2>
        <p>Because no payment is taken and nothing is shipped, there is nothing to return or refund for demo orders.</p>
        <h2>What a live policy would cover</h2>
        <ul>
          <li>The return window and who pays for return shipping.</li>
          <li>Sealed, unopened products versus opened consumables. For hygiene and safety reasons, opened food supplements are commonly not returnable.</li>
          <li>Damaged or incorrect items, including the evidence a customer needs to supply.</li>
          <li>How and when refunds are issued, and to which payment method.</li>
          <li>Statutory consumer rights, which differ by country (for example in the EU, UK, Canada, the United States and Türkiye).</li>
        </ul>
        <h2>Questions</h2>
        <p>Use the <Link href="/contact">contact page</Link>. No one will respond to demo messages.</p>
      </>
    ),
  },
  {
    slug: "privacy",
    title: "Privacy policy",
    description: "How the FORGE demo store handles data in the browser and on the local server.",
    updated: "21 October 2026",
    body: () => (
      <>
        {demoNote}
        <h2>What this demo stores</h2>
        <ul>
          <li><strong>In your browser (localStorage):</strong> your cart, shipping destination, favourites and recently viewed products. This stays on your device and is not sent anywhere until you place a demo order.</li>
          <li><strong>On the local server:</strong> when you place a demo order, the details you enter (name, email, phone, address, items) are written to a JSON file on the machine running the app. That file is a development convenience, not a secure production database.</li>
          <li><strong>Newsletter and contact forms:</strong> validated in the browser only. Nothing is stored or sent.</li>
        </ul>
        <h2>What it does not do</h2>
        <ul>
          <li>It does not collect payment card numbers, CVVs or any payment credentials.</li>
          <li>It does not use advertising or analytics trackers.</li>
          <li>It does not send email.</li>
        </ul>
        <h2>Clearing your data</h2>
        <p>Clear this site&apos;s storage in your browser settings to remove the cart and preferences. Demo orders live in the local <code>.data/orders.json</code> file, which the person running the app can delete.</p>
        <h2>Before going live</h2>
        <p>A real store needs a privacy notice that names the data controller, the legal basis for each use of personal data, retention periods, processors (payment, shipping, email) and data subject rights under the laws of each market, such as GDPR, UK GDPR, KVKK, CCPA and PIPEDA.</p>
      </>
    ),
  },
  {
    slug: "terms",
    title: "Terms and conditions",
    description: "Terms of use for the FORGE demo store.",
    updated: "21 October 2026",
    body: () => (
      <>
        {demoNote}
        <h2>About this site</h2>
        <p>{brand.name} is a fictional brand created for a portfolio project. The name is provisional and has not been cleared as a trademark. Products, formulations, nutrition values, prices, stock levels, delivery estimates and discount codes are invented.</p>
        <h2>Demo orders</h2>
        <p>Submitting the checkout creates a demo order record marked <em>unpaid (demo)</em>. It does not form a contract of sale, does not charge any payment method and will not be fulfilled.</p>
        <h2>Health information</h2>
        <p>Nothing on this site is medical advice or a health claim. Food supplements are not a substitute for a varied diet. Speak to a doctor before using supplements if you are pregnant, breast-feeding, under 18, taking medication or have a medical condition.</p>
        <h2>Liability</h2>
        <p>The site is provided as-is for demonstration. Do not rely on any product information for real purchasing, dosing or safety decisions.</p>
        <h2>Before going live</h2>
        <p>Real terms need to cover seller identity, pricing and taxes, payment, delivery, withdrawal and refund rights, warranty, liability limits, governing law and dispute resolution for every market served.</p>
      </>
    ),
  },
];

export function getPolicy(slug: string): Policy | undefined {
  return policies.find((p) => p.slug === slug);
}
