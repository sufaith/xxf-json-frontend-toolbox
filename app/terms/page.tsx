import type { Metadata } from "next";
import Link from "next/link";
import { AdSenseScript } from "@/components/AdSenseScript";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms covering use of XXF browser tools, shared note spaces, generated output and public network features",
  alternates: { canonical: "/terms/" },
};

export default function TermsPage() {
  return (
    <main className="legal-page">
      <AdSenseScript />
      <div className="legal-page__inner shell">
        <span className="kicker">Last updated September 2, 2026</span>
        <h1>Terms of Use</h1>
        <p>By using XXF Tools, you agree to use the service lawfully and to review generated output before relying on it.</p>
        <h2>No warranty</h2>
        <p>The tools and content are provided “as is” without warranties of accuracy, availability or fitness for a particular purpose. Converters can produce incomplete or unsuitable output when source data is incomplete, ambiguous or malformed.</p>
        <h2>Your responsibility</h2>
        <p>You are responsible for validating generated code, schemas, timestamps, encodings, media packages and converted data before production use. Do not use a network tool to access content you are not authorized to request.</p>
        <h2>Shared spaces</h2>
        <p>Named pages under <code>/n/</code> are link-accessible shared text spaces rather than private accounts. Do not store secrets, personal records, confidential material or unlawful content in a shared space. Anyone with the link may read or change its contents.</p>
        <h2>Availability and changes</h2>
        <p>Features may change, move or be discontinued. XXF may limit abusive automated traffic, oversized requests or misuse that affects the reliability or security of the free service.</p>
        <h2>Content and intellectual property</h2>
        <p>You retain rights to content you enter and output generated from it, subject to any rights already attached to the source material. XXF branding, editorial content and original interface design remain protected by applicable law.</p>
        <h2>Privacy</h2>
        <p>The <Link className="text-link" href="/privacy/">Privacy Policy</Link> explains which tools run locally and which features transmit a URL, connect to a stream or store shared text.</p>
      </div>
    </main>
  );
}
