import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PhotoCollageWorkbench } from "@/components/PhotoCollageWorkbench";
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
      url: `https://www.xxf.app/tools/${tool.slug}/`,
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
  const isPhotoCollage = tool.slug === "photo-collage-maker";
  const canonical = `https://www.xxf.app/tools/${tool.slug}/`;
  const applicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.seoDescription,
    applicationCategory: isPhotoCollage ? "MultimediaApplication" : "DeveloperApplication",
    operatingSystem: "Any modern browser",
    url: canonical,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: isPhotoCollage
      ? ["1–16 photo layouts", "Custom grid editor", "Local image positioning", "Text and shape annotations", "Watermarks", "JPG and PNG export"]
      : ["Local browser processing", "Copy result", "Download output", tool.description],
  };
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to use ${tool.name}`,
    description: tool.description,
    totalTime: "PT1M",
    step: [
      { "@type": "HowToStep", position: 1, name: `Add ${tool.inputLabel.toLowerCase()}`, text: isPhotoCollage ? "Choose or drop up to 16 photos into the local collage canvas." : `Paste or type ${tool.inputLabel.toLowerCase()} into the input editor.` },
      { "@type": "HowToStep", position: 2, name: tool.action, text: isPhotoCollage ? "Choose a layout, reposition each photo and adjust canvas styling or annotations." : `Choose any available options and select ${tool.action}.` },
      { "@type": "HowToStep", position: 3, name: "Copy or download", text: isPhotoCollage ? "Export the finished collage as JPG or PNG, or copy it to the clipboard." : "Review the locally generated output, then copy it or download a file." },
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
      { "@type": "ListItem", position: 1, name: "XXF Tools", item: "https://www.xxf.app/" },
      { "@type": "ListItem", position: 2, name: tool.category, item: `https://www.xxf.app/#tools` },
      { "@type": "ListItem", position: 3, name: tool.name, item: canonical },
    ],
  };

  return (
    <main>
      {[applicationSchema, howToSchema, faqSchema, breadcrumbSchema].map((schema, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <h1 className="sr-only">{tool.name}</h1>
      <section className={isPhotoCollage ? "photo-tool-page" : "tool-page-workbench shell"}>
        {isPhotoCollage ? <PhotoCollageWorkbench /> : <ToolWorkbench initialSlug={tool.slug} />}
      </section>

      <section className="content-grid shell">
        <article className="prose">
          <span className="kicker">How it works</span>
          <h2>A focused {tool.name.toLowerCase()} workflow.</h2>
          <p>{tool.description} {isPhotoCollage ? "XXF decodes, composes and exports every image inside your browser, so your photos do not need to be uploaded to a server." : "XXF runs the transformation in your browser so sensitive API payloads, tokens, configuration and source text do not need to cross the network."}</p>
          <h3>How to use {tool.name}</h3>
          <ol className="step-list">
            <li>{isPhotoCollage ? "Drop photos onto the canvas or choose up to 16 files from your device." : `Paste ${tool.inputLabel.toLowerCase()} into the left editor or load the realistic sample.`}</li>
            <li>{isPhotoCollage ? "Pick a balanced or featured layout, or build a custom grid. Drag photos to pan, then add styling, annotations or a watermark." : tool.directions ? `Choose ${tool.directions[0]} or ${tool.directions[1]}, then review the live result.` : `Select ${tool.action} or press Command/Ctrl + Enter.`}</li>
            <li>{isPhotoCollage ? "Choose JPG or PNG quality, then copy or download the final collage." : <>Copy the output to your project, or download it as a <code>.{tool.fileExtension}</code> file.</>}</li>
          </ol>
          <h3>When this tool helps</h3>
          <p>{isPhotoCollage ? "Create social posts, before-and-after comparisons, product contact sheets, printable photo grids, moodboards and annotated image explainers without handing private images to an online processing queue." : "Use it while debugging API responses, preparing fixtures, translating configuration, documenting integrations or moving data between frontend libraries. The dedicated output panel keeps the source untouched, which makes comparison and retrying safer."}</p>
          <h3>Accuracy and safety notes</h3>
          <p>{isPhotoCollage ? "The exported image uses the selected canvas ratio and quality. Very large source photos are resampled by your browser, and clipboard image support depends on browser permissions. Keep the tab open until you have downloaded your work." : "Generated code and schemas are starting points derived from the sample you provide. Review domain rules, optional values and security-sensitive behavior before shipping. For credentials or customer data, local processing reduces exposure but your own device and browser still need to be trusted."}</p>
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
