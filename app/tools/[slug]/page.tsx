import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ImageCompressorWorkbench } from "@/components/ImageCompressorWorkbench";
import { M3u8PlayerWorkbench } from "@/components/M3u8PlayerWorkbench";
import { PhotoCollageWorkbench } from "@/components/PhotoCollageWorkbench";
import { RedirectCheckerWorkbench } from "@/components/RedirectCheckerWorkbench";
import { ToolWorkbench } from "@/components/ToolWorkbench";
import { UrlParserWorkbench } from "@/components/UrlParserWorkbench";
import { toolMap, tools } from "@/lib/tools";

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
      url: `https://www.xxf.app/tools/${tool.slug}/`,
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
  const isPhotoCollage = tool.slug === "photo-collage-maker";
  const isImageCompressor = tool.slug === "image-compressor";
  const isUrlParser = tool.kind === "url-parser";
  const isRedirectChecker = tool.kind === "redirect-checker";
  const isVideoPlayer = tool.kind === "m3u8-player";
  const isImageTool = isPhotoCollage || isImageCompressor;
  const canonical = `https://www.xxf.app/tools/${tool.slug}/`;
  const organizationId = "https://www.xxf.app/#organization";
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
        isPartOf: { "@id": "https://www.xxf.app/#website" },
        breadcrumb: { "@id": `${canonical}#breadcrumb` },
        mainEntity: { "@id": applicationId },
        dateModified: "2026-08-24",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "XXF Tools", item: "https://www.xxf.app/" },
          { "@type": "ListItem", position: 2, name: tool.name, item: canonical },
        ],
      },
      {
        "@type": "WebApplication",
        "@id": applicationId,
        name: tool.name,
        alternateName: tool.keywords[0],
        description: tool.seoDescription,
        applicationCategory: isImageTool || isVideoPlayer ? "MultimediaApplication" : "DeveloperApplication",
        applicationSubCategory: tool.category,
        operatingSystem: "Any operating system with a modern web browser",
        browserRequirements: "Requires JavaScript and a modern web browser",
        softwareVersion: "1.0",
        url: canonical,
        image: "https://www.xxf.app/og.jpg",
        inLanguage: "en",
        isAccessibleForFree: true,
        publisher: { "@id": organizationId },
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
        featureList: isUrlParser
          ? ["URL component breakdown", "Query parameter inspection", "Nested URL expansion", "Copy parameter values"]
          : isRedirectChecker
          ? ["Redirect chain tracing", "Desktop and mobile user agents", "HTTP status inspection", "Final destination detection"]
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
        url: "https://www.xxf.app/",
        logo: { "@type": "ImageObject", url: "https://www.xxf.app/icon-512.png", width: 512, height: 512 },
      },
    ],
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(seoSchema) }} />
      <section className={isImageTool ? (isPhotoCollage ? "photo-tool-page" : "image-compressor-page") : (isUrlParser || isRedirectChecker) ? "utility-tool-page" : isVideoPlayer ? "video-tool-page" : "tool-page-workbench shell"}>
        {isPhotoCollage ? <PhotoCollageWorkbench /> : isImageCompressor ? <ImageCompressorWorkbench /> : isUrlParser ? <UrlParserWorkbench /> : isRedirectChecker ? <RedirectCheckerWorkbench /> : isVideoPlayer ? <M3u8PlayerWorkbench /> : <ToolWorkbench initialSlug={tool.slug} />}
      </section>
    </main>
  );
}
