import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs, PageHeader } from "@/components/layout/page-header";
import { getPolicy, policies } from "@/content/policies";

export function generateStaticParams() {
  return policies.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/policies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) return {};
  return { title: policy.title, description: policy.description, alternates: { canonical: `/policies/${policy.slug}` } };
}

export default async function PolicyPage({ params }: PageProps<"/policies/[slug]">) {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) notFound();
  return (
    <>
      <Breadcrumbs items={[{ label: "Policies" }, { label: policy.title }]} />
      <PageHeader eyebrow={`Updated ${policy.updated}`} title={policy.title} />
      <div className="container-x pb-8">
        <div className="prose-forge">{policy.body()}</div>
      </div>
    </>
  );
}
