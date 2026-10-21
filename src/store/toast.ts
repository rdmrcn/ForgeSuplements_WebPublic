"use client";

import { create } from "zustand";

export interface Toast {
  id: number;
  message: string;
  tone: "success" | "error" | "info";
  action?: { label: string; href: string };
}

interface ToastState {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => set((s) => ({ toasts: [...s.toasts.slice(-2), { ...toast, id: nextId++ }] })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (message: string, action?: Toast["action"]) =>
    useToastStore.getState().push({ message, tone: "success", action }),
  error: (message: string) => useToastStore.getState().push({ message, tone: "error" }),
  info: (message: string) => useToastStore.getState().push({ message, tone: "info" }),
};
