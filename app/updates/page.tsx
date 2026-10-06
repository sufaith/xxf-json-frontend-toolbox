import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "XXF Tools Updates and Maintenance Log",
  description: "A dated record of meaningful XXF Tools changes, verification work, documentation improvements and privacy-sensitive feature updates.",
  alternates: { canonical: "/updates/" },
};

const updates = [
  {
    date: "2026-10-06",
    title: "A more focused and readable public site",
    summary: "Reduced review risk by tightening the indexable topic surface and making evidence easier to read on every public tool page.",
    changes: [
      "Removed the unrelated museum promotion from the homepage and sitemaps while keeping its direct URL available",
      "Marked the museum noindex so the searchable site remains focused on browser utilities and technical guidance",
      "Added visible breadcrumbs and first-party specification links to each tool page",
      "Increased small navigation, card, source and verification text for more comfortable reading",
      "Excluded AdSense from upload-heavy media tools and the stream player in addition to private communication pages",
    ],
  },
  {
    date: "2026-10-05",
    title: "Clear authorship, navigation and verification evidence",
    summary: "Made the site's purpose and maintenance evidence easier to evaluate without changing the fast tool workflow.",
    changes: [
      "Added a visible homepage value statement and measured content summary",
      "Published a maintainer profile tied to the public source identity",
      "Added a distinct verification record for every one of the 30 tools",
      "Introduced familiar top-level navigation for tools, guides, updates and project information",
      "Rechecked indexable pages, structured data, canonical URLs and shared-space noindex boundaries",
    ],
  },
  {
    date: "2026-10-04",
    title: "Reproducible guides and expected outputs",
    summary: "Expanded the technical guides from general explanations into workflows readers can reproduce with synthetic data.",
    changes: [
      "Added tested input and expected-output fixtures for deterministic converters",
      "Added counterexamples that document known converter limitations",
      "Expanded 13 guides with concrete workflows, commands and browser checks",
      "Connected tool pages to relevant guides and first-party specifications",
      "Added automated checks that published examples still match current behavior",
    ],
  },
  {
    date: "2026-09-27",
    title: "Shared chat reliability and media controls",
    summary: "Improved the optional link-accessible chat feature while keeping advertising away from private communication screens.",
    changes: [
      "Added room-owner clearing with bearer-link access and explicit permanent-delete behavior",
      "Moved uploaded media to the configured R2 delivery domain with range-request support",
      "Added immediate local image previews and background upload progress",
      "Reduced default image display size and added click-to-view presentation",
      "Kept chat rooms and named note spaces outside the sitemap with noindex metadata",
    ],
  },
  {
    date: "2026-08-26",
    title: "Search, privacy and trust surface",
    summary: "Turned a collection of interfaces into a documented site with clear data boundaries and crawlable structure.",
    changes: [
      "Published About, Privacy, Terms, Contact and HTML sitemap pages",
      "Added unique metadata, canonical URLs and structured data to public tools",
      "Added XML sitemap, robots directives, ads.txt and security headers",
      "Separated browser-local tools from URL checks, stream requests and stored shared spaces",
      "Restricted AdSense loading to public content pages rather than private communication screens",
    ],
  },
];

export default function UpdatesPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "XXF Tools updates and maintenance log",
    url: "https://xxf.app/updates/",
    dateModified: updates[0].date,
    author: { "@id": "https://xxf.app/authors/sufaith/#person" },
    hasPart: updates.map((update) => ({ "@type": "Article", headline: update.title, datePublished: update.date, description: update.summary })),
  };

  return (
    <main className="updates-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header className="updates-page__hero shell">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Updates</span></nav>
        <span className="kicker">Public maintenance record</span>
        <h1>What changed,<br />and why it matters.</h1>
        <p>This log records meaningful product, documentation and privacy changes. It is intentionally selective: routine dependency bumps and cosmetic edits belong in the source history, while changes that affect visitors are explained here.</p>
      </header>
      <div className="updates-timeline shell">
        {updates.map((update, index) => (
          <article className="update-entry" key={update.date + update.title}>
            <div className="update-entry__date"><span>{String(index + 1).padStart(2, "0")}</span><time dateTime={update.date}>{update.date}</time></div>
            <div className="update-entry__body"><h2>{update.title}</h2><p>{update.summary}</p><ul>{update.changes.map((change) => <li key={change}>{change}</li>)}</ul></div>
          </article>
        ))}
      </div>
      <section className="updates-source"><div className="shell"><h2>Inspect the underlying work</h2><p>The public repository contains the complete commit history, implementation and tests. This page summarizes that evidence; it does not replace it.</p><a className="primary-button" href="https://github.com/sufaith/xxf-json-frontend-toolbox/commits/main/" target="_blank" rel="noreferrer">View commit history <span>↗</span></a></div></section>
    </main>
  );
}
