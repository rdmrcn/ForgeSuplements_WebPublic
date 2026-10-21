import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="container-x py-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-stone">
        <li>
          <Link href="/" className="hover:text-ink">Home</Link>
        </li>
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1.5">
            <ChevronRight className="size-3" aria-hidden />
            {item.href && i < items.length - 1 ? (
              <Link href={item.href} className="hover:text-ink">{item.label}</Link>
            ) : (
              <span aria-current="page" className="text-ink">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="container-x pb-8 pt-6 sm:pb-12 sm:pt-10">
      {eyebrow && <p className="eyebrow mb-3 text-stone" data-reveal>{eyebrow}</p>}
      <h1 className="display text-[clamp(3rem,9vw,7.5rem)]" data-reveal style={{ ["--i" as string]: 1 }}>
        {title}
      </h1>
      {description && (
        <p className="mt-5 max-w-2xl text-lg text-ink/70" data-reveal style={{ ["--i" as string]: 2 }}>
          {description}
        </p>
      )}
      {children}
    </header>
  );
}
