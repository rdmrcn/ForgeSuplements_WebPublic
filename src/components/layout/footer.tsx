import Link from "next/link";
import { brand } from "@/config/brand";
import { footerNav } from "@/config/navigation";
import { HelpDeskLink } from "@/components/help/help-desk";
import { NewsletterForm } from "@/components/home/newsletter-form";
import { Logo } from "@/components/ui/logo";

function Column({ title, links, extra }: { title: string; links: readonly { label: string; href: string }[]; extra?: React.ReactNode }) {
  return (
    <nav aria-label={title}>
      <h2 className="eyebrow mb-4 text-bone/55">{title}</h2>
      <ul className="space-y-2.5 text-[0.9375rem]">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className="link-underline text-bone/90 hover:text-bone">
              {l.label}
            </Link>
          </li>
        ))}
        {extra && <li>{extra}</li>}
      </ul>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="grain relative mt-24 overflow-hidden bg-ink text-bone">
      <div className="container-x relative z-10 pt-16">
        <div className="grid gap-12 border-b border-bone/15 pb-14 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="eyebrow text-ember">Newsletter</p>
            <h2 className="display mt-3 text-[clamp(2.5rem,6vw,4.75rem)]">
              Training notes,<br />
              <span className="serif-italic normal-case text-bone/70">not noise.</span>
            </h2>
            <p className="mt-4 max-w-md text-bone/70">
              Restocks and new flavours, occasionally. Demo form: nothing is stored or sent.
            </p>
          </div>
          <div className="lg:pt-8">
            <NewsletterForm />
          </div>
        </div>

        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <Logo className="text-bone" />
            <p className="mt-4 max-w-xs text-sm text-bone/65">{brand.slogan} A fictional premium sports nutrition brand and e-commerce demo.</p>
            <address className="mt-6 text-sm not-italic text-bone/65">
              {brand.contact.address.map((l) => (
                <span key={l} className="block">{l}</span>
              ))}
              <a href={`mailto:${brand.contact.email}`} className="mt-2 block text-bone underline underline-offset-4">
                {brand.contact.email}
              </a>
              <span className="mt-1 block">{brand.contact.hours}</span>
            </address>
          </div>
          <Column title="Shop" links={footerNav.shop} />
          <Column
            title="Help"
            links={footerNav.help}
            extra={<HelpDeskLink className="link-underline text-left text-ember hover:text-bone">Ask the help desk</HelpDeskLink>}
          />
          <Column title="Company" links={footerNav.company} />
          <Column title="Legal" links={footerNav.legal} />
        </div>

        <div className="border-t border-bone/15 py-6 text-xs leading-relaxed text-bone/55">
          <p className="max-w-4xl">
            Demo store. {brand.name} is a provisional, fictional brand name and has not been cleared as a trademark. All products, formulations,
            nutrition values, prices, shipping rates and delivery times are illustrative; nothing here is verified label data or a health claim.
            No payments are taken and no orders are shipped. Food supplements are not a substitute for a varied diet.
          </p>
          <p className="mt-3">&copy; {new Date().getFullYear()} {brand.legalName}. Portfolio project.</p>
        </div>
      </div>
      <div aria-hidden className="display pointer-events-none relative z-0 -mb-[3.2vw] select-none text-center text-[22vw] leading-[0.8] text-bone/[0.04]">
        {brand.name}
      </div>
    </footer>
  );
}
