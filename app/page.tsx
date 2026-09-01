import type { Metadata } from "next";
import Link from "next/link";
import { ToolExplorer } from "@/components/ToolExplorer";
import { guides } from "@/lib/guides";
import { tools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Browser Tools for JSON, Frontend, Image & Video",
  description:
    "Browse 30 free JSON, data, frontend, encoding, image and video tools that run privately in your browser.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://xxf.app/",
    siteName: "XXF Tools",
    title: "Free JSON, Frontend, Image & Video Tools — XXF Tools",
    description: "Use 30 fast, private browser tools for JSON, data conversion, encoding, frontend work, images and video.",
    images: [{ url: "/og.jpg", width: 1536, height: 1024, alt: "XXF JSON, frontend, image and video tools" }],
  },
};

const homeFaqs = [
  {
    question: "Does XXF upload the data I paste into a tool?",
    answer: "Text and file transformations run in the current browser tab. XXF does not receive or store converter input. The redirect checker is the exception: it sends only the public URL you ask the server to inspect, and the M3U8 player requests the stream directly from its host.",
  },
  {
    question: "Are generated types and schemas ready for production?",
    answer: "They are starting points inferred from the sample you provide. Review optional fields, nullability, formats, ranges and business rules, then validate untrusted data at runtime.",
  },
  {
    question: "Why does every tool include its own guide?",
    answer: "Format conversion has edge cases that a button cannot explain. Each page documents the expected input, a reliable workflow, practical uses and limitations specific to that tool.",
  },
  {
    question: "Can I use XXF without creating an account?",
    answer: "Yes. The public tools are free to use without registration. Copy or download the result when you are finished because local editor contents are not stored as an account history.",
  },
];

export default function Home() {
  const homeSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://xxf.app/#organization",
        name: "XXF Tools",
        url: "https://xxf.app/",
        logo: { "@type": "ImageObject", url: "https://xxf.app/icon-512.png", width: 512, height: 512 },
      },
      {
        "@type": "WebSite",
        "@id": "https://xxf.app/#website",
        name: "XXF Tools",
        url: "https://xxf.app/",
        description: "Private browser-based JSON, frontend, image and video tools.",
        inLanguage: "en",
        publisher: { "@id": "https://xxf.app/#organization" },
      },
      {
        "@type": "WebPage",
        "@id": "https://xxf.app/#webpage",
        url: "https://xxf.app/",
        name: "Free JSON, Frontend, Image & Video Tools",
        description: "Use 30 fast, private browser tools for JSON, data conversion, encoding, frontend work, images and video.",
        inLanguage: "en",
        isPartOf: { "@id": "https://xxf.app/#website" },
        about: { "@id": "https://xxf.app/#organization" },
        mainEntity: { "@id": "https://xxf.app/#tools" },
        dateModified: "2026-09-01",
      },
      {
        "@type": "ItemList",
        "@id": "https://xxf.app/#tools",
        name: "XXF browser tools",
        numberOfItems: tools.length,
        itemListElement: tools.map((tool, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: tool.name,
          description: tool.description,
          url: `https://xxf.app/tools/${tool.slug}/`,
        })),
      },
    ],
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: homeFaqs.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
  };

  return (
    <main className="home-tool-directory">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <h1 className="sr-only">XXF browser tools</h1>
      <section className="home-tool-directory__inner shell" id="tools" aria-label="XXF tools">
        <ToolExplorer />
      </section>

      <section className="home-value-section shell" aria-labelledby="why-xxf-title">
        <div className="section-heading section-heading--split">
          <div><span className="kicker">Built for careful work</span><h2 id="why-xxf-title">A useful result includes the edges</h2></div>
          <p>XXF combines focused browser tools with explanations of what each conversion preserves, what it cannot infer and what deserves review before production use</p>
        </div>
        <div className="trust-grid">
          <article className="trust-card trust-card--dark"><span>01</span><h3>Local by default</h3><p>JSON, text, image and video transformations run on your device, keeping work-in-progress payloads out of an upload queue</p><b>Browser processing →</b></article>
          <article className="trust-card"><span>02</span><h3>Specific guidance</h3><p>Every tool page explains its expected input, repeatable workflow, useful scenarios and format-specific limitations</p><b>30 practical guides →</b></article>
          <article className="trust-card trust-card--accent"><span>03</span><h3>Reviewable output</h3><p>Keep the source visible, inspect errors, compare the result and copy or download only after it matches the destination contract</p><b>Input → review → output</b></article>
        </div>
      </section>

      <section className="home-value-section shell" id="guides" aria-labelledby="guides-title">
        <div className="section-heading section-heading--split">
          <div><span className="kicker">Technical field notes</span><h2 id="guides-title">Understand the format, not only the conversion</h2></div>
          <p>Original guides cover syntax, runtime validation, data-shape mismatches and security boundaries that are easy to miss in a one-click workflow</p>
        </div>
        <div className="guide-grid">
          {guides.map((guide, index) => <Link className="guide-card" href={`/guides/${guide.slug}/`} key={guide.slug}><span>{String(index + 1).padStart(2, "0")} · {guide.readTime}</span><h3>{guide.title}</h3><p>{guide.description}</p><b>Read guide ↗</b></Link>)}
        </div>
      </section>

      <section className="home-faq-section">
        <div className="shell faq-layout">
          <div><span className="kicker">Before you paste</span><h2>Know where the data goes</h2><p>Use the public tools without an account, then copy or download the reviewed result</p></div>
          <div className="faq-list">
            {homeFaqs.map((item) => <details key={item.question}><summary>{item.question}<span>+</span></summary><p>{item.answer}</p></details>)}
          </div>
        </div>
      </section>
    </main>
  );
}
