import type { Metadata } from "next";
import Link from "next/link";
import { ToolExplorer } from "@/components/ToolExplorer";
import { ToolWorkbench } from "@/components/ToolWorkbench";
import { guides } from "@/lib/guides";
import { tools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "JSON Formatter & Frontend Developer Tools",
  description:
    "Format, validate and convert JSON, YAML, CSV, XML, TypeScript, Zod, Base64, JWT and frontend data in your browser. Free and private.",
  alternates: { canonical: "/" },
};

const faqs = [
  {
    question: "Are XXF developer tools free?",
    answer: "Yes. Every converter is free to use without an account, watermark or daily limit.",
  },
  {
    question: "Does XXF upload my JSON or tokens?",
    answer:
      "No. Transformations run inside your browser tab. XXF does not receive, store or inspect your source data.",
  },
  {
    question: "Which JSON conversions are supported?",
    answer:
      "XXF supports formatting, validation, minification, key sorting and conversion to TypeScript, Zod, JSON Schema, YAML, CSV, XML, HTML and Markdown.",
  },
  {
    question: "Can I use XXF on a phone or tablet?",
    answer:
      "Yes. The editor, tool search and converter pages are responsive and work with touch, keyboards and modern mobile browsers.",
  },
];

export default function Home() {
  const quickTools = ["json-formatter", "json-validator", "json-to-typescript", "json-to-yaml", "csv-to-json", "jwt-decoder"]
    .map((slug) => tools.find((tool) => tool.slug === slug))
    .filter((tool): tool is (typeof tools)[number] => Boolean(tool));
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "XXF Tools",
    url: "https://www.xxf.app/",
    description: "Private browser-based JSON, frontend and image tools.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.xxf.app/?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
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
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className="workspace-hero" id="playground">
        <div className="workspace-hero__inner shell">
          <div className="workspace-intro">
            <div>
              <div className="hero__badge"><span /> {tools.length} tools · local by default</div>
              <h1>Choose a tool. <em>Start instantly.</em></h1>
              <p>Format, validate and convert without uploads, accounts or waiting.</p>
            </div>
            <div className="quick-launch" aria-label="Quick launch tools">
              <span>Quick launch</span>
              <div>{quickTools.map((tool) => <Link key={tool.slug} href={`/tools/${tool.slug}/`}><b>{tool.category.slice(0, 1)}</b>{tool.name}</Link>)}</div>
            </div>
          </div>
          <ToolWorkbench initialSlug="json-formatter" compact />
        </div>
      </section>

      <section className="section section--tint" id="tools">
        <div className="shell">
          <div className="section-heading section-heading--split">
            <div><span className="kicker">The complete toolbox</span><h2>One tab for the work between the work.</h2></div>
            <p>Search by task, choose a converter and keep your flow moving. Every tool has a dedicated, shareable page.</p>
          </div>
          <ToolExplorer />
        </div>
      </section>

      <section className="section shell">
        <div className="trust-grid">
          <article className="trust-card trust-card--dark"><span>01</span><h3>Private by architecture</h3><p>Your source text stays in memory inside the current browser tab. There is no upload queue, account database or server-side conversion.</p><b>0 bytes sent →</b></article>
          <article className="trust-card"><span>02</span><h3>Built for real data</h3><p>Standards-based parsers handle quoted CSV fields, YAML structures, XML attributes and Unicode-safe Base64.</p><b>Reliable parsers →</b></article>
          <article className="trust-card trust-card--accent"><span>03</span><h3>Fast handoff</h3><p>Copy the result, download a correctly named file or jump straight to the reverse converter.</p><b>Input → output → shipped</b></article>
        </div>
      </section>

      <section className="section shell" id="guides">
        <div className="section-heading section-heading--split">
          <div><span className="kicker">Practical field notes</span><h2>Use the format. Understand the edges.</h2></div>
          <p>Concise guides for safer conversions, stronger type boundaries and fewer “why did this parse differently?” moments.</p>
        </div>
        <div className="guide-grid">
          {guides.map((guide, index) => (
            <Link className="guide-card" href={`/guides/${guide.slug}/`} key={guide.slug}>
              <span>{String(index + 1).padStart(2, "0")} · {guide.readTime}</span>
              <h3>{guide.title}</h3>
              <p>{guide.description}</p>
              <b>Read guide ↗</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="section section--faq">
        <div className="shell faq-layout">
          <div><span className="kicker">Questions, parsed</span><h2>Small answers to common edge cases.</h2><p>Still deciding? Start with the formatter—your input never leaves the browser.</p></div>
          <div className="faq-list">
            {faqs.map((item) => <details key={item.question}><summary>{item.question}<span>+</span></summary><p>{item.answer}</p></details>)}
          </div>
        </div>
      </section>

      <section className="closing-cta shell">
        <span className="kicker">Ready when your payload isn’t</span>
        <h2>Make messy data useful.</h2>
        <Link className="primary-button primary-button--large" href="/tools/json-formatter/">Open JSON Formatter <span>↗</span></Link>
      </section>
    </main>
  );
}
