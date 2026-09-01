import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact and Feedback",
  description: "Report a problem, suggest an improvement or review the public source code for XXF Tools",
  alternates: { canonical: "/contact/" },
};

export default function ContactPage() {
  return (
    <main className="legal-page">
      <div className="legal-page__inner shell">
        <span className="kicker">Contact and feedback</span>
        <h1>Help improve XXF</h1>
        <p>XXF Tools is maintained as a public software project. Bug reports, reproducible conversion examples and focused feature requests help improve both the tools and their documentation.</p>
        <h2>Report a tool problem</h2>
        <p>Open a GitHub issue and include the tool name, browser, expected result and a minimal sample that contains no credentials or personal information.</p>
        <p><a className="text-link" href="https://github.com/sufaith/xxf-json-frontend-toolbox/issues" target="_blank" rel="noreferrer">Open the public issue tracker ↗</a></p>
        <h2>Review the implementation</h2>
        <p>The source code is public so visitors can inspect how browser-local transformations work, report inaccuracies and follow changes over time.</p>
        <p><a className="text-link" href="https://github.com/sufaith/xxf-json-frontend-toolbox" target="_blank" rel="noreferrer">View the source repository ↗</a></p>
        <h2>Protect sensitive data</h2>
        <p>Never include access tokens, private URLs, customer records or unpublished source code in a public issue. Replace sensitive values with a minimal synthetic example.</p>
        <p><Link className="text-link" href="/privacy/">Read the privacy policy →</Link></p>
      </div>
    </main>
  );
}
