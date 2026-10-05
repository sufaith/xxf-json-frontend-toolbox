import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sufaith — Maintainer of XXF Tools",
  description: "About Sufaith, the developer and documentation maintainer responsible for XXF Tools, its test fixtures and technical guides.",
  alternates: { canonical: "/authors/sufaith/" },
};

export default function SufaithAuthorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://xxf.app/authors/sufaith/#person",
    name: "Sufaith",
    url: "https://xxf.app/authors/sufaith/",
    sameAs: ["https://github.com/sufaith"],
    jobTitle: "Developer and maintainer of XXF Tools",
    knowsAbout: ["JSON", "frontend development", "browser APIs", "data conversion", "image processing", "HLS video"],
    worksFor: { "@id": "https://xxf.app/#organization" },
  };

  return (
    <main className="legal-page author-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <article className="legal-page__inner shell">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/about/">About</Link><span>/</span><span>Sufaith</span></nav>
        <span className="kicker">Developer · maintainer · documentation reviewer</span>
        <h1>Sufaith</h1>
        <p>Sufaith maintains the implementation and technical documentation for XXF Tools. The name matches the public GitHub account that owns the source repository, so visitors can inspect the code, commit history, issues and corrections behind the site rather than relying on an invented biography.</p>

        <h2>What the maintainer is responsible for</h2>
        <p>The work covers browser interfaces, conversion logic, deterministic test fixtures, privacy boundaries and the explanations attached to each tool. A change is not treated as documentation-only when it alters behavior: the corresponding example, limitation and expected output are reviewed with the implementation.</p>
        <ul>
          <li>Designing and maintaining the browser tools and shared interfaces</li>
          <li>Checking representative inputs against committed expected outputs</li>
          <li>Documenting cases where a generic conversion cannot preserve domain meaning</li>
          <li>Reviewing whether processing is local, network-dependent or durably stored</li>
          <li>Correcting reproducible problems through the public repository</li>
        </ul>

        <h2>Scope of expertise</h2>
        <p>XXF focuses on practical frontend workflows: JSON syntax and schema inference, structured-data conversion, URL and text encoding, browser image processing and HLS packaging or playback. The documentation deliberately distinguishes implementation experience from authority. Normative claims link to the relevant RFC, W3C, WHATWG, NIST or official platform documentation.</p>
        <p>Generated types, schemas, configuration and media packages remain starting points. The maintainer does not claim that a synthetic sample can discover private business rules, security requirements or every behavior of a destination system.</p>

        <h2>Evidence you can inspect</h2>
        <p>The <a className="text-link" href="https://github.com/sufaith/xxf-json-frontend-toolbox" target="_blank" rel="noreferrer">public source repository ↗</a> contains the current implementation and test history. The <Link className="text-link" href="/editorial-policy/">editorial standards</Link> describe the review method, while <Link className="text-link" href="/updates/">site updates</Link> summarize meaningful public changes.</p>

        <h2>Corrections</h2>
        <p>A useful correction includes the page URL, browser, a minimal synthetic input, expected behavior and actual behavior. Do not publish credentials or private production data in an issue. Use the <Link className="text-link" href="/contact/">contact and feedback page</Link> for reporting guidance.</p>
      </article>
    </main>
  );
}
