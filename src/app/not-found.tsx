import { LinkButton } from "@/components/ui/button";
import { categories } from "@/domain/catalog";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-start justify-center py-20">
      <p className="eyebrow text-stone">Error 404</p>
      <h1 className="display mt-3 text-[clamp(4rem,14vw,11rem)]">Off the plate</h1>
      <p className="mt-4 max-w-md text-lg text-ink/70">That page does not exist, or the product has moved. Try the shop or one of the categories below.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <LinkButton href="/shop">Shop all</LinkButton>
        <LinkButton href="/" variant="outline">Home</LinkButton>
      </div>
      <ul className="mt-8 flex flex-wrap gap-2 text-sm">
        {categories.map((c) => (
          <li key={c.id}>
            <Link href={`/shop/${c.slug}`} className="border border-line-strong px-3 py-1.5 hover:bg-ink hover:text-bone">{c.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
