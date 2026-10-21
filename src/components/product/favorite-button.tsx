"use client";

import { Heart } from "lucide-react";
import { clsx } from "clsx";
import { toast } from "@/store/toast";
import { useFavoritesStore } from "@/store/lists";

export function FavoriteButton({ productId, title, className, withLabel }: { productId: string; title: string; className?: string; withLabel?: boolean }) {
  const active = useFavoritesStore((s) => s.ids.includes(productId));
  const toggle = useFavoritesStore((s) => s.toggle);
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remove ${title} from favourites` : `Save ${title} to favourites`}
      onClick={() => {
        const added = toggle(productId);
        toast.info(added ? `${title} saved to favourites.` : `${title} removed from favourites.`);
      }}
      className={clsx(
        "inline-flex items-center justify-center gap-2 transition-colors",
        withLabel ? "h-12 border border-line-strong px-4 text-xs font-semibold uppercase tracking-wider hover:bg-ink hover:text-bone" : "size-10 bg-bone/80 backdrop-blur hover:bg-bone",
        className,
      )}
    >
      <Heart className={clsx("size-[1.15rem] transition-transform", active && "scale-110 fill-ember stroke-ember")} aria-hidden />
      {withLabel && <span>{active ? "Saved" : "Save"}</span>}
    </button>
  );
}
