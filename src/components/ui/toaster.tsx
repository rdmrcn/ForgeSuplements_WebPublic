"use client";

import { Check, Info, X, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useToastStore, type Toast } from "@/store/toast";

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss);
  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(toast.id), 4500);
    return () => window.clearTimeout(timer);
  }, [toast.id, dismiss]);

  const Icon = toast.tone === "success" ? Check : toast.tone === "error" ? AlertTriangle : Info;
  return (
    <div
      role={toast.tone === "error" ? "alert" : "status"}
      className="pointer-events-auto flex w-full max-w-md items-center gap-3 border border-bone/15 bg-ink px-4 py-3 text-sm text-bone shadow-[var(--shadow-soft)] [animation:toast-in_0.4s_var(--ease-out-expo)_both]"
    >
      <span className={toast.tone === "error" ? "text-[#ff8a80]" : "text-ember"}>
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="flex-1">{toast.message}</span>
      {toast.action && (
        <Link href={toast.action.href} className="font-semibold uppercase tracking-wider text-ember hover:underline" onClick={() => dismiss(toast.id)}>
          {toast.action.label}
        </Link>
      )}
      <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification" className="text-bone/60 hover:text-bone">
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex flex-col items-center gap-2 px-4 sm:bottom-6"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
