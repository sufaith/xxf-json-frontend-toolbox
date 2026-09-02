import type { Metadata } from "next";
import Link from "next/link";
import { guideTopics, guides } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Technical Guides for Browser Tools and Data Formats",
  description: "Original field guides for JSON, data conversion, browser APIs, images, video and security-sensitive developer workflows",
  alternates: { canonical: "/guides/" },
};

export default function GuidesPage() {
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "XXF technical guides",
    url: "https://xxf.app/guides/",
    description: "Practical guides for browser-based developer, image and video workflows",
    hasPart: guides.map((guide) => ({ "@type": "TechArticle", headline: guide.title, url: `https://xxf.app/guides/${guide.slug}/` })),
  };

  return (
    <main className="guide-index">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <header className="guide-index__hero shell">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Guides</span></nav>
        <span className="kicker">XXF field notes</span>
        <h1>Use the tool<br />Understand the edge</h1>
        <p>Original, implementation-aware guides for the format decisions, browser boundaries and safety checks that do not fit inside a converter interface</p>
        <div className="guide-index__facts"><span>{guides.length} guides</span><span>{guideTopics.length} topics</span><span>Primary references included</span></div>
      </header>

      <div className="guide-index__topics shell">
        {guideTopics.map((topic) => (
          <section className="guide-topic" key={topic} aria-labelledby={`topic-${topic.toLowerCase().replaceAll(" ", "-")}`}>
            <div className="guide-topic__heading"><span>{String(guideTopics.indexOf(topic) + 1).padStart(2, "0")}</span><h2 id={`topic-${topic.toLowerCase().replaceAll(" ", "-")}`}>{topic}</h2><p>{guides.filter((guide) => guide.topic === topic).length} guides</p></div>
            <div className="guide-topic__grid">
              {guides.filter((guide) => guide.topic === topic).map((guide) => <Link className="guide-index-card" href={`/guides/${guide.slug}/`} key={guide.slug}><span>{guide.readTime}</span><h3>{guide.title}</h3><p>{guide.description}</p><b>Read guide ↗</b></Link>)}
            </div>
          </section>
        ))}
      </div>

      <section className="guide-method">
        <div className="shell"><span className="kicker">Editorial method</span><h2>Grounded in the implementation</h2><div><p>Each guide is checked against the corresponding XXF tool so documented inputs, outputs and limitations match the behavior visitors can test</p><p>Normative specifications and primary platform documentation appear at the end of every article for readers who need the authoritative details</p><p>Examples use synthetic data and call out decisions that require application-specific validation <Link href="/editorial-policy/">Read the full review standards →</Link></p></div></div>
      </section>
    </main>
  );
}
