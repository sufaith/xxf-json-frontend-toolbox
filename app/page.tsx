import type { Metadata } from "next";
import { ToolExplorer } from "@/components/ToolExplorer";
import { tools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Browser Tools for JSON, Frontend, Image & Video",
  description:
    "Browse 29 free JSON, data, frontend, encoding, image and video tools that run privately in your browser.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.xxf.app/",
    siteName: "XXF Tools",
    title: "Free JSON, Frontend, Image & Video Tools — XXF Tools",
    description: "Use 29 fast, private browser tools for JSON, data conversion, encoding, frontend work, images and video.",
    images: [{ url: "/og.jpg", width: 1536, height: 1024, alt: "XXF JSON, frontend, image and video tools" }],
  },
};

export default function Home() {
  const homeSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.xxf.app/#organization",
        name: "XXF Tools",
        url: "https://www.xxf.app/",
        logo: { "@type": "ImageObject", url: "https://www.xxf.app/icon-512.png", width: 512, height: 512 },
      },
      {
        "@type": "WebSite",
        "@id": "https://www.xxf.app/#website",
        name: "XXF Tools",
        url: "https://www.xxf.app/",
        description: "Private browser-based JSON, frontend, image and video tools.",
        inLanguage: "en",
        publisher: { "@id": "https://www.xxf.app/#organization" },
      },
      {
        "@type": "WebPage",
        "@id": "https://www.xxf.app/#webpage",
        url: "https://www.xxf.app/",
        name: "Free JSON, Frontend, Image & Video Tools",
        description: "Use 29 fast, private browser tools for JSON, data conversion, encoding, frontend work, images and video.",
        inLanguage: "en",
        isPartOf: { "@id": "https://www.xxf.app/#website" },
        about: { "@id": "https://www.xxf.app/#organization" },
        mainEntity: { "@id": "https://www.xxf.app/#tools" },
        dateModified: "2026-08-24",
      },
      {
        "@type": "ItemList",
        "@id": "https://www.xxf.app/#tools",
        name: "XXF browser tools",
        numberOfItems: tools.length,
        itemListElement: tools.map((tool, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: tool.name,
          description: tool.description,
          url: `https://www.xxf.app/tools/${tool.slug}/`,
        })),
      },
    ],
  };

  return (
    <main className="home-tool-directory">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }} />
      <h1 className="sr-only">XXF browser tools</h1>
      <section className="home-tool-directory__inner shell" id="tools" aria-label="XXF tools">
        <ToolExplorer />
      </section>
    </main>
  );
}
