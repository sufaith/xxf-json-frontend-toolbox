import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ImageCompressorWorkbench } from "@/components/ImageCompressorWorkbench";
import { PhotoCollageWorkbench } from "@/components/PhotoCollageWorkbench";
import { ToolWorkbench } from "@/components/ToolWorkbench";
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
  const isPhotoCollage = tool.slug === "photo-collage-maker";
  const isImageCompressor = tool.slug === "image-compressor";
  const isImageTool = isPhotoCollage || isImageCompressor;
  const canonical = `https://www.xxf.app/tools/${tool.slug}/`;
  const applicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.seoDescription,
    applicationCategory: isImageTool ? "MultimediaApplication" : "DeveloperApplication",
    operatingSystem: "Any modern browser",
    url: canonical,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: isPhotoCollage
      ? ["1–16 photo layouts", "Custom grid editor", "Local image positioning", "Text and shape annotations", "Watermarks", "JPG and PNG export"]
      : isImageCompressor
        ? ["Batch image compression", "Smart output selection", "Quality and resize controls", "ZIP download", "Local browser processing"]
        : ["Local browser processing", "Copy result", "Download output", tool.description],
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationSchema) }} />
      <h1 className="sr-only">{tool.name}</h1>
      <section className={isImageTool ? (isPhotoCollage ? "photo-tool-page" : "image-compressor-page") : "tool-page-workbench shell"}>
        {isPhotoCollage ? <PhotoCollageWorkbench /> : isImageCompressor ? <ImageCompressorWorkbench /> : <ToolWorkbench initialSlug={tool.slug} />}
      </section>
    </main>
  );
}
