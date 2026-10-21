"use client";

import { clsx } from "clsx";
import { useId, type InputHTMLAttributes, type Ref, type SelectHTMLAttributes } from "react";

interface BaseProps {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  className?: string;
}

const controlClass =
  "h-12 w-full border bg-white/60 px-3.5 text-[0.9375rem] text-ink placeholder:text-stone/70 transition-colors focus:border-ink focus:bg-white focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember disabled:opacity-50";

function Shell({
  id,
  label,
  error,
  hint,
  optional,
  className,
  children,
}: BaseProps & { id: string; children: React.ReactNode }) {
  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="flex items-baseline justify-between text-[0.8125rem] font-medium">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-stone">Optional</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-stone">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField({
  label,
  error,
  hint,
  optional,
  className,
  ref,
  ...props
}: BaseProps & InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> }) {
  const id = useId();
  return (
    <Shell id={id} label={label} error={error} hint={hint} optional={optional} className={className}>
      <input
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={clsx(controlClass, error ? "border-danger" : "border-line-strong")}
        {...props}
      />
    </Shell>
  );
}

export function SelectField({
  label,
  error,
  hint,
  optional,
  className,
  children,
  ref,
  ...props
}: BaseProps & SelectHTMLAttributes<HTMLSelectElement> & { ref?: Ref<HTMLSelectElement> }) {
  const id = useId();
  return (
    <Shell id={id} label={label} error={error} hint={hint} optional={optional} className={className}>
      <select
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={clsx(controlClass, "appearance-none bg-[length:12px] bg-[right_0.9rem_center] bg-no-repeat pr-9", error ? "border-danger" : "border-line-strong")}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' fill='none' stroke='%230b0b0a' stroke-width='1.6'/></svg>\")",
        }}
        {...props}
      >
        {children}
      </select>
    </Shell>
  );
}

export function CheckboxField({
  label,
  error,
  className,
  ref,
  ...props
}: { label: React.ReactNode; error?: string; className?: string } & InputHTMLAttributes<HTMLInputElement> & {
    ref?: Ref<HTMLInputElement>;
  }) {
  const id = useId();
  return (
    <div className={className}>
      <div className="flex items-start gap-3">
        <input
          id={id}
          ref={ref}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="check mt-0.5 size-5 shrink-0 cursor-pointer appearance-none border border-line-strong bg-white/60 checked:border-ink checked:bg-ink focus-visible:ring-2 focus-visible:ring-ember"
          {...props}
        />
        <label htmlFor={id} className="cursor-pointer text-sm leading-snug">
          {label}
        </label>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 pl-8 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
