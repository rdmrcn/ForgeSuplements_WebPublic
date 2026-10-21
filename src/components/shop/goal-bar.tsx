"use client";

import { clsx } from "clsx";
import { useEffect, useRef } from "react";
import { Dumbbell, Flame, HeartPulse, LayoutGrid, TrendingUp, Zap, type LucideIcon } from "lucide-react";
import { goals, products } from "@/domain/catalog";
import type { BrowseFilters } from "@/domain/search";
import type { CategoryId, GoalId } from "@/domain/types";

const icons: Record<GoalId | "all", LucideIcon> = {
  all: LayoutGrid,
  "muscle-gain": Dumbbell,
  "mass-gain": TrendingUp,
  "fat-burn": Flame,
  performance: Zap,
  health: HeartPulse,
};

interface Props {
  filters: BrowseFilters;
  onChange: (next: BrowseFilters) => void;
  /** Category ids that have at least one product under the selected goal. */
  typeOptions: { id: CategoryId; name: string; count: number }[];
}

export function GoalBar({ filters, onChange, typeOptions }: Props) {
  const selected = filters.goals[0];
  const rail = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = rail.current;
    const active = el?.querySelector<HTMLElement>("[aria-pressed=true]");
    if (el && active && el.scrollWidth > el.clientWidth) {
      el.scrollTo({ left: active.offsetLeft - (el.clientWidth - active.offsetWidth) / 2, behavior: "smooth" });
    }
  }, [selected]);
  const activeGoal = goals.find((g) => g.id === selected);

  function pickGoal(id?: GoalId) {
    const next = id ? [id] : [];
    const allowed = new Set(
      products.filter((p) => !id || p.goals.includes(id)).map((p) => p.categoryId),
    );
    onChange({ ...filters, goals: next, categories: filters.categories.filter((c) => allowed.has(c)) });
  }

  const tile = (active: boolean) =>
    clsx(
      "group flex min-w-[9.5rem] shrink-0 snap-start flex-col items-start gap-3 border p-4 text-left transition-colors sm:min-w-0",
      active ? "border-ink bg-ink text-bone" : "border-line-strong bg-white/40 hover:border-ink",
    );

  return (
    <div className="pt-2 pb-6" data-testid="goal-bar">
      <p id="goal-label" className="eyebrow mb-3 text-stone">Shop by goal</p>
      <div
        ref={rail}
        role="group"
        aria-labelledby="goal-label"
        className="relative -mx-[clamp(1rem,3.2vw,3rem)] flex snap-x gap-2 overflow-x-auto px-[clamp(1rem,3.2vw,3rem)] pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6"
      >
        {[{ id: undefined as GoalId | undefined, name: "All goals", count: products.length }, ...goals.map((g) => ({ id: g.id as GoalId | undefined, name: g.name, count: products.filter((p) => p.goals.includes(g.id)).length }))].map((g) => {
          const Icon = icons[g.id ?? "all"];
          const active = g.id === selected;
          return (
            <button key={g.id ?? "all"} type="button" aria-pressed={active} onClick={() => pickGoal(g.id)} className={tile(active)} data-testid={`goal-${g.id ?? "all"}`}>
              <Icon className={clsx("size-5", active ? "text-ember" : "text-ink")} aria-hidden />
              <span>
                <span className="display block text-xl leading-none sm:text-2xl">{g.name}</span>
                <span className={clsx("mt-1 block text-xs", active ? "text-bone/65" : "text-stone")}>{g.count} products</span>
              </span>
            </button>
          );
        })}
      </div>

      {activeGoal && (
        <div className="mt-5 grid gap-4 border-l-2 border-ember pl-4 lg:grid-cols-[1fr_auto] lg:items-end" data-testid="goal-detail">
          <div>
            <h2 className="display text-3xl">{activeGoal.name}</h2>
            <p className="mt-1 max-w-2xl text-sm text-stone">
              {activeGoal.blurb}
              {activeGoal.note && <> {activeGoal.note}</>}
            </p>
          </div>
        </div>
      )}

      {typeOptions.length > 1 && (
        <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Product type">
          <span className="eyebrow mr-1 text-stone">Type</span>
          {typeOptions.map((t) => {
            const on = filters.categories.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={on}
                onClick={() => onChange({ ...filters, categories: on ? filters.categories.filter((c) => c !== t.id) : [...filters.categories, t.id] })}
                className={clsx(
                  "border px-3 py-1.5 text-sm transition-colors",
                  on ? "border-ember bg-ember text-ink" : "border-line-strong hover:border-ink",
                )}
                data-testid={`type-${t.id}`}
              >
                {t.name} <span className="text-xs opacity-60">{t.count}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
