import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { guideMap, guides } from "@/lib/guides";
import { toolMap } from "@/lib/tools";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return guides.map((guide) => ({ slug: guide.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideMap.get(slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}/` },
    openGraph: { type: "article", url: `https://xxf.app/guides/${guide.slug}/`, title: guide.title, description: guide.description, publishedTime: guide.updated, modifiedTime: guide.updated, images: ["/og.jpg"] },
    twitter: { card: "summary_large_image", title: guide.title, description: guide.description, images: ["/og.jpg"] },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = guideMap.get(slug);
  if (!guide) notFound();
  const relatedTools = guide.relatedTools.map((toolSlug) => toolMap.get(toolSlug)).filter((tool) => Boolean(tool));
  const articleSchema = { "@context": "https://schema.org", "@type": "TechArticle", headline: guide.title, description: guide.description, datePublished: guide.updated, dateModified: guide.updated, articleSection: guide.topic, citation: guide.references.map((reference) => reference.url), author: { "@type": "Organization", name: "XXF Tools", url: "https://xxf.app/about/" }, publisher: { "@type": "Organization", name: "XXF Tools" }, mainEntityOfPage: `https://xxf.app/guides/${guide.slug}/` };
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "XXF Tools", item: "https://xxf.app/" }, { "@type": "ListItem", position: 2, name: "Guides", item: "https://xxf.app/guides/" }, { "@type": "ListItem", position: 3, name: guide.title, item: `https://xxf.app/guides/${guide.slug}/` }] };
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <article className="article-shell">
        <header className="article-hero"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/guides/">Guides</Link><span>/</span><span>Article</span></nav><span className="article-topic">{guide.topic}</span><h1>{guide.title}</h1><p>{guide.description}</p><div className="article-meta"><span>{guide.readTime}</span><span>Updated {guide.updated}</span></div></header>
        <div className="article-body">
          {guide.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}</section>)}
          <section className="article-references"><span className="kicker">Primary references</span><h2>Read the specification</h2><div>{guide.references.map((reference) => <a href={reference.url} target="_blank" rel="noreferrer" key={reference.url}><span>{reference.publisher}</span><strong>{reference.title}</strong><b>↗</b></a>)}</div></section>
          <div className="article-tool-cta"><div><h3>Put the guide into practice</h3><p>Open the related browser tools and test the workflow with a synthetic sample</p></div><div className="article-tool-links">{relatedTools.map((tool) => tool && <Link className="primary-button" href={`/tools/${tool.slug}/`} key={tool.slug}>{tool.name} <span>↗</span></Link>)}</div></div>
        </div>
      </article>
    </main>
  );
}
