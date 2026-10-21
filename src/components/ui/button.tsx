import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { clsx } from "clsx";

type Variant = "primary" | "accent" | "outline" | "ghost" | "inverse" | "outline-inverse";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-bone border-ink hover:bg-ember hover:text-ink hover:border-ember",
  accent: "bg-ember text-ink border-ember hover:bg-ink hover:text-bone hover:border-ink",
  outline: "bg-transparent text-ink border-line-strong hover:bg-ink hover:text-bone hover:border-ink",
  ghost: "bg-transparent text-ink border-transparent hover:bg-ink/6",
  inverse: "bg-bone text-ink border-bone hover:bg-ember hover:border-ember",
  "outline-inverse": "bg-transparent text-bone border-bone/40 hover:bg-bone hover:text-ink hover:border-bone",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.75rem]",
  md: "h-12 px-6 text-[0.8125rem]",
  lg: "h-14 px-8 text-[0.875rem]",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  full,
  className,
}: {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  className?: string;
} = {}) {
  return clsx(
    "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap border font-semibold uppercase tracking-[0.1em] transition-[background-color,color,border-color,transform] duration-200 ease-out",
    "active:translate-y-px active:scale-[0.985] disabled:pointer-events-none disabled:opacity-40",
    variants[variant],
    sizes[size],
    full && "w-full",
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
}

export function Button({ variant, size, full, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses({ variant, size, full, className })} {...props} />;
}

type LinkButtonProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size; full?: boolean };

export function LinkButton({ variant, size, full, className, ...props }: LinkButtonProps) {
  return <Link className={buttonClasses({ variant, size, full, className })} {...props} />;
}
