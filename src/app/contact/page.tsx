import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/config/brand";
import { Breadcrumbs, PageHeader } from "@/components/layout/page-header";
import { ContactForm } from "@/components/contact/contact-form";
import { Accordion } from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Contact and support",
  description: "Support information for the FORGE demo store: contact details, order help and common questions.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <PageHeader eyebrow="Support" title="Contact" description="This is a demo store, so no one is on the other end. Here is what a real support page would offer." />
      <div className="container-x grid gap-14 pb-16 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        <div>
          <dl className="space-y-6 border-t border-line pt-6">
            <div>
              <dt className="eyebrow text-stone">Email</dt>
              <dd className="mt-1"><a className="underline underline-offset-4" href={`mailto:${brand.contact.email}`}>{brand.contact.email}</a> <span className="text-sm text-stone">(example address)</span></dd>
            </div>
            <div>
              <dt className="eyebrow text-stone">Phone</dt>
              <dd className="mt-1">{brand.contact.phone}</dd>
            </div>
            <div>
              <dt className="eyebrow text-stone">Hours</dt>
              <dd className="mt-1">{brand.contact.hours}</dd>
            </div>
            <div>
              <dt className="eyebrow text-stone">Address</dt>
              <dd className="mt-1">{brand.contact.address.join(", ")}</dd>
            </div>
          </dl>

          <div id="orders" className="mt-10 scroll-mt-28">
            <h2 className="display text-3xl">Demo orders</h2>
            <p className="mt-2 text-ink/75">Demo orders are not shipped and cannot be tracked. After checkout you see a confirmation page with your demo order number; keep the link if you want to revisit it.</p>
          </div>

          <div className="mt-10 border-t border-line">
            <Accordion title="Can I buy these products?">Not here. FORGE is fictional and the checkout is a demo that never charges money.</Accordion>
            <Accordion title="Where do you ship?">The demo supports Türkiye, the United States, Canada, Germany, Austria and the United Kingdom, with illustrative rates. See the <Link className="underline" href="/policies/shipping">shipping policy</Link>.</Accordion>
            <Accordion title="Are the nutrition facts accurate?">No. They are illustrative placeholders, labelled as such on every product page.</Accordion>
            <Accordion title="Do you have third-party testing?">No certifications are claimed. A real launch would require accredited batch testing.</Accordion>
          </div>
        </div>
        <div>
          <h2 className="display mb-5 text-3xl">Send a message</h2>
          <ContactForm />
        </div>
      </div>
    </>
  );
}
