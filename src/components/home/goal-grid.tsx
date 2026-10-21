import { ArrowUpRight, Dumbbell, Flame, HeartPulse, TrendingUp, Zap, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { getProductsByGoal, goals } from "@/domain/catalog";
import type { GoalId } from "@/domain/types";

const icons: Record<GoalId, LucideIcon> = {
  "muscle-gain": Dumbbell,
  "mass-gain": TrendingUp,
  "fat-burn": Flame,
  performance: Zap,
  health: HeartPulse,
};

export function GoalGrid() {
  return (
    <section className="container-x py-20 sm:py-28" aria-labelledby="goal-heading">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-stone">Shop by goal</p>
          <h2 id="goal-heading" className="display mt-2 text-[clamp(2.75rem,7vw,6rem)]">
            What are you <span className="serif-italic">training</span> for?
          </h2>
        </div>
        <Link href="/shop" className="link-underline text-sm font-semibold uppercase tracking-wider">Shop all</Link>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {goals.map((g) => {
          const Icon = icons[g.id];
          const items = getProductsByGoal(g.id);
          return (
            <li key={g.id}>
              <Link
                href={`/shop?goal=${g.id}`}
                className="group flex h-full min-h-56 flex-col justify-between border border-line-strong bg-white/40 p-5 transition-colors hover:border-ink hover:bg-ink hover:text-bone"
              >
                <div className="flex items-start justify-between">
                  <Icon className="size-7 text-ember" aria-hidden />
                  <ArrowUpRight className="size-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden />
                </div>
                <div>
                  <h3 className="display text-3xl leading-none">{g.name}</h3>
                  <p className="mt-2 text-sm text-stone group-hover:text-bone/70">{g.blurb}</p>
                  <p className="eyebrow mt-3 text-stone group-hover:text-bone/60">{items.length} products</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
