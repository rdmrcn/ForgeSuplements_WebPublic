import type { Metadata } from "next";
import { Breadcrumbs, PageHeader } from "@/components/layout/page-header";
import { FavoritesView } from "@/components/favorites/favorites-view";

export const metadata: Metadata = { title: "Favourites", robots: { index: false, follow: false } };

export default function FavoritesPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Favourites" }]} />
      <PageHeader eyebrow="Saved on this device" title="Favourites" />
      <FavoritesView />
    </>
  );
}
