import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSenseScript } from "@/components/AdSenseScript";
import { ImageCompressorWorkbench } from "@/components/ImageCompressorWorkbench";
import { M3u8PlayerWorkbench } from "@/components/M3u8PlayerWorkbench";
import { PhotoCollageWorkbench } from "@/components/PhotoCollageWorkbench";
import { RedirectCheckerWorkbench } from "@/components/RedirectCheckerWorkbench";
import { ToolWorkbench } from "@/components/ToolWorkbench";
import { UrlParserWorkbench } from "@/components/UrlParserWorkbench";
import { VideoToM3u8Workbench } from "@/components/VideoToM3u8Workbench";
import { guideMap } from "@/lib/guides";
import { toolEditorial } from "@/lib/tool-editorial";
import { toolExamples } from "@/lib/tool-examples";
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
    title: `Free Online ${tool.name}`,
    description: tool.seoDescription,
    keywords: tool.keywords,
    category: tool.category,
    alternates: { canonical: `/tools/${tool.slug}/` },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: "XXF Tools",
      url: `https://xxf.app/tools/${tool.slug}/`,
      title: `Free Online ${tool.name} — Private Browser Tool`,
      description: tool.seoDescription,
      images: [{ url: "/og.jpg", width: 1536, height: 1024, alt: `${tool.name} on XXF Tools` }],
    },
    twitter: { card: "summary_large_image", title: `Free Online ${tool.name}`, description: tool.seoDescription, images: ["/og.jpg"] },
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = toolMap.get(slug);
  if (!tool) notFound();
  const editorial = toolEditorial[tool.slug];
  if (!editorial) notFound();
  const example = toolExamples[tool.slug];
  if (!example) notFound();
  const related = getRelatedTools(tool);
  const relatedGuides = editorial.guideSlugs.map((guideSlug) => guideMap.get(guideSlug)).filter((guide) => Boolean(guide));
  const isPhotoCollage = tool.slug === "photo-collage-maker";
  const isImageCompressor = tool.slug === "image-compressor";
  const isUrlParser = tool.kind === "url-parser";
  const isRedirectChecker = tool.kind === "redirect-checker";
  const isVideoPlayer = tool.kind === "m3u8-player";
  const isVideoConverter = tool.kind === "video-to-m3u8";
  const isVideoTool = isVideoPlayer || isVideoConverter;
  const isImageTool = isPhotoCollage || isImageCompressor;
  const canonical = `https://xxf.app/tools/${tool.slug}/`;
  const organizationId = "https://xxf.app/#organization";
  const applicationId = `${canonical}#application`;
  const seoSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: `Free Online ${tool.name}`,
        description: tool.seoDescription,
        inLanguage: "en",
        isPartOf: { "@id": "https://xxf.app/#website" },
        breadcrumb: { "@id": `${canonical}#breadcrumb` },
        mainEntity: { "@id": applicationId },
        author: { "@id": organizationId },
        reviewedBy: { "@id": organizationId },
        lastReviewed: "2026-09-02",
        publishingPrinciples: "https://xxf.app/editorial-policy/",
        dateModified: "2026-09-02",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "XXF Tools", item: "https://xxf.app/" },
          { "@type": "ListItem", position: 2, name: tool.name, item: canonical },
        ],
      },
      {
        "@type": "WebApplication",
        "@id": applicationId,
        name: tool.name,
        alternateName: tool.keywords[0],
        description: tool.seoDescription,
        applicationCategory: isImageTool || isVideoTool ? "MultimediaApplication" : "DeveloperApplication",
        applicationSubCategory: tool.category,
        operatingSystem: "Any operating system with a modern web browser",
        browserRequirements: "Requires JavaScript and a modern web browser",
        softwareVersion: "1.0",
        url: canonical,
        image: "https://xxf.app/og.jpg",
        inLanguage: "en",
        isAccessibleForFree: true,
        publisher: { "@id": organizationId },
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
        featureList: isUrlParser
          ? ["URL component breakdown", "Query parameter inspection", "Nested URL expansion", "Copy parameter values"]
          : isRedirectChecker
          ? ["Redirect chain tracing", "Desktop and mobile user agents", "HTTP status inspection", "Final destination detection"]
            : isVideoConverter
              ? ["Local video to HLS conversion", "M3U8 playlist generation", "MPEG-TS segment output", "ZIP download", "Browser-local WebAssembly processing"]
            : isVideoPlayer
              ? ["M3U8 and HLS playback", "Native Safari HLS support", "Adaptive bitrate playback", "Fullscreen video controls"]
            : isPhotoCollage
              ? ["1–16 photo layouts", "Custom grid editor", "Local image positioning", "Text and shape annotations", "Watermarks", "JPG and PNG export"]
              : isImageCompressor
                ? ["Batch image compression", "Smart output selection", "Quality and resize controls", "ZIP download", "Local browser processing"]
                : ["Local browser processing", "Copy result", "Download output", tool.description],
      },
      {
        "@type": "Organization",
        "@id": organizationId,
        name: "XXF Tools",
        url: "https://xxf.app/",
        logo: { "@type": "ImageObject", url: "https://xxf.app/icon-512.png", width: 512, height: 512 },
        sameAs: ["https://github.com/sufaith/xxf-json-frontend-toolbox"],
        publishingPrinciples: "https://xxf.app/editorial-policy/",
      },
    ],
  };
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to use ${tool.name}`,
    description: tool.description,
    step: editorial.steps.map((step, index) => ({ "@type": "HowToStep", position: index + 1, text: step })),
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tool.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <main>
      <AdSenseScript />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(seoSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <section className={isImageTool ? (isPhotoCollage ? "photo-tool-page" : "image-compressor-page") : (isUrlParser || isRedirectChecker) ? "utility-tool-page" : isVideoTool ? "video-tool-page" : "tool-page-workbench shell"}>
        {isPhotoCollage ? <PhotoCollageWorkbench /> : isImageCompressor ? <ImageCompressorWorkbench /> : isUrlParser ? <UrlParserWorkbench /> : isRedirectChecker ? <RedirectCheckerWorkbench /> : isVideoPlayer ? <M3u8PlayerWorkbench /> : isVideoConverter ? <VideoToM3u8Workbench /> : <ToolWorkbench initialSlug={tool.slug} />}
      </section>

      <section className="tool-editorial shell" aria-labelledby="tool-guide-title">
        <article className="tool-editorial__article prose">
          <span className="kicker">Practical guide</span>
          <h2 id="tool-guide-title">How to use {tool.name}</h2>
          {editorial.overview.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}

          <h3>A reliable workflow</h3>
          <ol className="step-list">
            {editorial.steps.map((step) => <li key={step}>{step}</li>)}
          </ol>

          <h3>Worked example</h3>
          <div className="worked-example">
            <span>Scenario</span>
            <p>{example.scenario}</p>
            {tool.sample && <div className="worked-example__input"><small>Included sample input</small><pre><code>{tool.sample}</code></pre></div>}
            <span>What to notice</span>
            <p>{example.observation}</p>
          </div>

          <h3>When this tool helps</h3>
          <ul className="editorial-checklist">
            {editorial.useCases.map((useCase) => <li key={useCase}>{useCase}</li>)}
          </ul>

          <h3>Accuracy and safety notes</h3>
          <ul className="editorial-notes">
            {editorial.notes.map((note) => <li key={note}>{note}</li>)}
          </ul>

          <h3>Frequently asked questions</h3>
          <div className="faq-list faq-list--light">
            {tool.faq.map((item) => <details key={item.question}><summary>{item.question}<span>+</span></summary><p>{item.answer}</p></details>)}
          </div>
          <footer className="editorial-byline"><span>Reviewed September 2, 2026</span><p>Written and implementation-checked by the XXF Tools editorial team</p><Link href="/editorial-policy/">How XXF reviews tool guidance →</Link></footer>
        </article>

        <aside className="tool-editorial__aside" aria-label="Related resources">
          <div className="sidebar-card">
            <span>{tool.category} toolkit</span>
            <h3>Continue the workflow</h3>
            <p>Move to a related tool without sending your working data to XXF</p>
            {related.map((item) => <Link href={`/tools/${item.slug}/`} key={item.slug}><span>{item.name}</span><b>↗</b></Link>)}
          </div>
          {relatedGuides.length > 0 && <div className="editorial-guides"><span className="kicker">Related reading</span>{relatedGuides.map((guide) => guide && <Link href={`/guides/${guide.slug}/`} key={guide.slug}><strong>{guide.title}</strong><small>{guide.readTime}</small></Link>)}</div>}
        </aside>
      </section>

      <section className="related-section">
        <div className="shell">
          <span className="kicker">Related tools</span>
          <div className="related-grid">
            {related.map((item) => <Link className="related-card" href={`/tools/${item.slug}/`} key={item.slug}><span>{item.category}</span><h3>{item.name}</h3><p>{item.description}</p><b>Open tool ↗</b></Link>)}
          </div>
        </div>
      </section>
    </main>
  );
}
