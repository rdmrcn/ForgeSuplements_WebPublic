"use client";

import { clsx } from "clsx";
import { useEffect, useRef, useState, type ReactNode } from "react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: "right" | "left" | "top";
  label: string;
  className?: string;
  children: ReactNode;
}

/**
 * Modal drawer built on the native <dialog> element, so focus is trapped, the page
 * behind is inert and Escape works without custom plumbing. Animation is CSS only
 * and is disabled by prefers-reduced-motion.
 */
export function Drawer({ open, onClose, side = "right", label, className, children }: DrawerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [shown, setShown] = useState(false);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) {
      lastFocus.current = document.activeElement as HTMLElement | null;
      if (!dialog.open) dialog.showModal();
      const raf = requestAnimationFrame(() => setShown(true));
      return () => {
        cancelAnimationFrame(raf);
        setShown(false);
      };
    }
    const timer = window.setTimeout(() => {
      if (dialog.open) dialog.close();
      lastFocus.current?.focus?.();
    }, 380);
    return () => window.clearTimeout(timer);
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      data-state={open && shown ? "open" : "closed"}
      className="drawer"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div data-side={side} className={clsx("drawer-panel", className)}>
        {children}
      </div>
    </dialog>
  );
}
