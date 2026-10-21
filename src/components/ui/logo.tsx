import { brand } from "@/config/brand";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M3 3h18v5H9v3h9v5H9v5H3z" fill="currentColor" />
      <path d="M13 21l8-8v8z" fill="var(--color-ember)" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <LogoMark className="size-6" />
      <span className="display text-[1.65rem] leading-none tracking-[0.12em]">{brand.name}</span>
      <span className="sr-only">home</span>
    </span>
  );
}
