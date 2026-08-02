import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolWorkbench } from "@/components/ToolWorkbench";
import { getRelatedTools, toolMap, tools } from "@/lib/tools";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = toolMap.get(slug);
  if (!tool) return {};
  return {
    title: `${tool.name} — Free Online Tool`,
    description: tool.seoDescription,
    keywords: tool.keywords,
    alternates: { canonical: `/tools/${tool.slug}/` },
    openGraph: {
      type: "website",
      url: `https://xxf.app/tools/${tool.slug}/`,
      title: `${tool.name} — Free, fast and private`,
      description: tool.seoDescription,
      images: [{ url: "/og.png", width: 1536, height: 1024, alt: `${tool.name} on XXF Tools` }],
    },
    twitter: { card: "summary_large_image", title: tool.name, description: tool.seoDescription, images: ["/og.png"] },
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = toolMap.get(slug);
  if (!tool) notFound();
  const related = getRelatedTools(tool);
  const canonical = `https://xxf.app/tools/${tool.slug}/`;
  const applicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.seoDescription,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any modern browser",
    url: canonical,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: ["Local browser processing", "Copy result", "Download output", tool.description],
  };
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to use ${tool.name}`,
    description: tool.description,
    totalTime: "PT1M",
    step: [
      { "@type": "HowToStep", position: 1, name: `Add ${tool.inputLabel.toLowerCase()}`, text: `Paste or type ${tool.inputLabel.toLowerCase()} into the input editor.` },
      { "@type": "HowToStep", position: 2, name: tool.action, text: `Choose any available options and select ${tool.action}.` },
      { "@type": "HowToStep", position: 3, name: "Copy or download", text: "Review the locally generated output, then copy it or download a file." },
    ],
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tool.faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "XXF Tools", item: "https://xxf.app/" },
      { "@type": "ListItem", position: 2, name: tool.category, item: `https://xxf.app/#tools` },
      { "@type": "ListItem", position: 3, name: tool.name, item: canonical },
    ],
  };

  return (
    <main>
      {[applicationSchema, howToSchema, faqSchema, breadcrumbSchema].map((schema, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <section className="page-hero shell">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/#tools">{tool.category}</Link><span>/</span><span>{tool.name}</span></nav>
        <div className="page-hero__grid">
          <div><span className="kicker">{tool.eyebrow}</span><h1>{tool.name}</h1></div>
          <div className="page-hero__intro"><p>{tool.seoDescription}</p><div className="page-hero__meta"><span>Free</span><span>No sign-up</span><span>Local only</span></div></div>
        </div>
      </section>

      <section className="tool-page-workbench shell"><ToolWorkbench initialSlug={tool.slug} /></section>

      <section className="content-grid shell">
        <article className="prose">
          <span className="kicker">How it works</span>
          <h2>A focused {tool.name.toLowerCase()} workflow.</h2>
          <p>{tool.description} XXF runs the transformation in your browser so sensitive API payloads, tokens, configuration and source text do not need to cross the network.</p>
          <h3>How to use {tool.name}</h3>
          <ol className="step-list">
            <li>Paste {tool.inputLabel.toLowerCase()} into the left editor or load the realistic sample.</li>
            <li>{tool.directions ? `Choose ${tool.directions[0]} or ${tool.directions[1]}, then review the live result.` : `Select ${tool.action} or press Command/Ctrl + Enter.`}</li>
            <li>Copy the output to your project, or download it as a <code>.{tool.fileExtension}</code> file.</li>
          </ol>
          <h3>When this tool helps</h3>
          <p>Use it while debugging API responses, preparing fixtures, translating configuration, documenting integrations or moving data between frontend libraries. The dedicated output panel keeps the source untouched, which makes comparison and retrying safer.</p>
          <h3>Accuracy and safety notes</h3>
          <p>Generated code and schemas are starting points derived from the sample you provide. Review domain rules, optional values and security-sensitive behavior before shipping. For credentials or customer data, local processing reduces exposure but your own device and browser still need to be trusted.</p>
          <h3>Frequently asked questions</h3>
          <div className="faq-list faq-list--light">
            {tool.faq.map((item) => <details key={item.question}><summary>{item.question}<span>+</span></summary><p>{item.answer}</p></details>)}
          </div>
        </article>
        <aside>
          <div className="sidebar-card"><span>{tool.category} workflow</span><h3>Keep converting.</h3><p>Move between related formats without hunting for another website.</p>{related.map((item) => <Link href={`/tools/${item.slug}/`} key={item.slug}><span>{item.name}</span><b>↗</b></Link>)}</div>
        </aside>
      </section>

      <section className="related-section"><div className="shell"><span className="kicker">Related converters</span><div className="related-grid">{related.map((item) => <Link className="related-card" href={`/tools/${item.slug}/`} key={item.slug}><span>{item.category}</span><h3>{item.name}</h3><p>{item.description}</p><b>Open ↗</b></Link>)}</div></div></section>
    </main>
  );
}
