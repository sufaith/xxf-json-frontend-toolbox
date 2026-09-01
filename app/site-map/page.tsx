import type { Metadata } from "next";
import Link from "next/link";
import { guides } from "@/lib/guides";
import { categories, tools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Sitemap — All XXF Tools and Guides",
  description: "Browse every XXF JSON, data, frontend, encoding, image and video tool, plus technical guides and site policies.",
  alternates: { canonical: "/site-map/" },
};

export default function SiteMapPage() {
  return (
    <main className="legal-page site-map-page">
      <div className="site-map-page__inner">
        <div className="site-map-page__intro">
          <span className="kicker">Sitemap</span>
          <h1>Everything on XXF.</h1>
          <p>Open any browser-local tool directly. Each tool is free to use and processes your input on your device.</p>
        </div>
        <div className="site-map-page__groups">
          {categories.map((category) => (
            <section className="site-map-page__group" key={category}>
              <h2>{category} tools</h2>
              <nav aria-label={`${category} tools`}>
                {tools.filter((tool) => tool.category === category).map((tool) => <Link href={`/tools/${tool.slug}/`} key={tool.slug}>{tool.name}</Link>)}
              </nav>
            </section>
          ))}
          <section className="site-map-page__group">
            <h2>Experiences</h2>
            <nav aria-label="Interactive experiences">
              <Link href="/animal/">Prehistoric Animal Museum</Link>
            </nav>
          </section>
          <section className="site-map-page__group">
            <h2>Guides</h2>
            <nav aria-label="Technical guides">
              <Link href="/guides/">All technical guides</Link>
              {guides.map((guide) => <Link href={`/guides/${guide.slug}/`} key={guide.slug}>{guide.title}</Link>)}
            </nav>
          </section>
          <section className="site-map-page__group">
            <h2>Site information</h2>
            <nav aria-label="Site information">
              <Link href="/">Home</Link>
              <Link href="/about/">About</Link>
              <Link href="/guides/">Guides</Link>
              <Link href="/contact/">Contact</Link>
              <Link href="/privacy/">Privacy Policy</Link>
              <Link href="/terms/">Terms</Link>
              <Link href="/sitemap.xml">XML Sitemap</Link>
            </nav>
          </section>
        </div>
      </div>
    </main>
  );
}
