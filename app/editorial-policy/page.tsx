import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Editorial Standards and Review Process",
  description: "How XXF Tools writes, tests, sources, reviews and corrects its technical guides and tool documentation",
  alternates: { canonical: "/editorial-policy/" },
};

export default function EditorialPolicyPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "XXF Tools editorial standards and review process",
    url: "https://xxf.app/editorial-policy/",
    dateModified: "2026-10-06",
    lastReviewed: "2026-10-06",
    author: { "@type": "Person", name: "Sufaith", url: "https://xxf.app/authors/sufaith/", sameAs: ["https://github.com/sufaith"] },
    reviewedBy: { "@type": "Organization", name: "XXF Tools", url: "https://xxf.app/about/" },
  };

  return (
    <main className="legal-page editorial-policy-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <article className="legal-page__inner shell">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Editorial standards</span></nav>
        <span className="kicker">Last reviewed October 6, 2026</span>
        <h1>Editorial standards</h1>
        <p>XXF publishes technical guidance to explain what each browser tool does, where its output is useful and which decisions still require human review. The editorial material is part of the product rather than a separate content-marketing feed, so every claim should correspond to behavior a visitor can inspect in the public implementation.</p>

        <h2>Ownership and purpose</h2>
        <p><Link className="text-link" href="/authors/sufaith/">Sufaith</Link> writes and maintains the tool instructions, worked examples, safety notes and long-form guides alongside the implementation. The goal is to help visitors complete a small technical task and understand the boundary of the result. Content is not commissioned from anonymous contributors or generated as interchangeable pages around search keywords.</p>
        <p>XXF is a software project, not a standards body, security auditor or substitute for documentation supplied by the system that will consume the output. Generated code, schemas, hashes, converted data and media packages remain starting points that must be tested in their destination environment.</p>

        <h2>How a tool page is reviewed</h2>
        <p>Review starts with the implementation. The editor runs the included synthetic sample, reads the relevant transformation code and checks the visible input labels, options, output and error behavior. File-based tools are exercised with representative local media, while network tools are checked against their explicit server or cross-origin boundary.</p>
        <ol className="editorial-policy-checks">
          <li><strong>Behavior</strong><span>The documented input, options and output match the current interface</span></li>
          <li><strong>Example</strong><span>The scenario is reproducible without credentials, private files or personal data</span></li>
          <li><strong>Limitations</strong><span>The page names important cases the tool cannot validate or preserve</span></li>
          <li><strong>Safety</strong><span>Privacy and security claims distinguish browser-local work from network requests</span></li>
          <li><strong>Connections</strong><span>Related guides and tools extend the workflow without creating misleading promises</span></li>
        </ol>

        <h2>Verification evidence</h2>
        <p>Each public tool page carries its own verification record: the exact method used, the behavior that should remain invariant and a known boundary that the tool cannot resolve. Deterministic converters are compared with committed expected outputs. Network and media tools use an explicit manual or network protocol because their results depend on a browser, remote host or selected file.</p>
        <p>The build also checks unique metadata, crawlable internal links, private-route noindex directives, advertising scope and the presence of every guide, example and verification record. Passing a test does not make a broad accuracy claim; it provides reproducible evidence for one documented behavior.</p>

        <h2>Sources and technical claims</h2>
        <p>Long-form guides prefer normative specifications and first-party platform documentation: RFC Editor publications, W3C and WHATWG standards, NIST publications, official language documentation and browser-platform references. Secondary explanations may help with examples, but they do not replace an available primary source for protocol or syntax behavior.</p>
        <p>References appear visibly at the end of each guide and are also represented in article metadata. A citation supports the technical background; it does not imply that the publisher endorses XXF or has reviewed this site.</p>

        <h2>Updates and corrections</h2>
        <p>Tool guidance is reviewed when implementation behavior changes, when a new workflow is introduced or when a material documentation error is reported. Pages display a review date so visitors can distinguish a recently checked workflow from an older explanation. Small copy edits do not claim a new technical review unless the example and behavior were checked again.</p>
        <p>Anyone can report an inaccurate result, unclear limitation or broken source through the public issue tracker. A useful report includes the page, browser, expected behavior and a minimal synthetic sample. Confirmed problems are corrected in the same public repository that contains the implementation.</p>

        <h2>Advertising independence</h2>
        <p>Advertising may support hosting and maintenance, but advertisers do not select guide topics, approve conclusions or receive access to converter input. An advertisement is not an endorsement, and editorial pages do not rank tools or formats according to commercial relationships.</p>
        <p>Advertising code is deliberately excluded from shared notes, chat rooms, upload-heavy media workbenches, the stream player and other pages where private communication, selected media or a download action is the primary focus. This separation protects the working surface from misleading placement and keeps advertising on public, reviewable content pages.</p>

        <h2>Contact the maintainers</h2>
        <p>Read more about the project on the <Link className="text-link" href="/about/">About page</Link>, inspect the <Link className="text-link" href="/updates/">maintenance log</Link>, review the <a className="text-link" href="https://github.com/sufaith/xxf-json-frontend-toolbox" target="_blank" rel="noreferrer">public source repository</a> or use the <Link className="text-link" href="/contact/">contact and feedback page</Link> to report a correction.</p>
      </article>
    </main>
  );
}
