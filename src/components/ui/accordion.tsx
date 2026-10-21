import { Plus } from "lucide-react";
import type { ReactNode } from "react";

export function Accordion({
  title,
  children,
  defaultOpen,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="accordion border-b border-line" open={defaultOpen}>
      <summary className="flex items-center justify-between gap-4 py-5 text-left">
        <span className="display text-[1.35rem] leading-none">{title}</span>
        <Plus className="accordion-icon size-5 shrink-0" aria-hidden />
      </summary>
      <div className="pb-6 text-[0.9375rem] leading-relaxed text-ink/80">{children}</div>
    </details>
  );
}
