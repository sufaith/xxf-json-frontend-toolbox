import type { Metadata } from "next";
import { ToolExplorer } from "@/components/ToolExplorer";
import { tools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Browser Tools for JSON, Frontend & Images",
  description:
    "Browse 26 free JSON, data, frontend, encoding and image tools that run privately in your browser.",
  alternates: { canonical: "/" },
};

export default function Home() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "XXF Tools",
    url: "https://www.xxf.app/",
    description: "Private browser-based JSON, frontend and image tools.",
  };
  const appSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "XXF JSON, Frontend & Image Toolbox",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any modern web browser",
    url: "https://www.xxf.app/",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: tools.map((tool) => tool.name),
  };

  return (
    <main className="home-tool-directory">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />
      <h1 className="sr-only">XXF browser tools</h1>
      <section className="home-tool-directory__inner shell" id="tools" aria-label="XXF tools">
        <ToolExplorer />
      </section>
    </main>
  );
}
