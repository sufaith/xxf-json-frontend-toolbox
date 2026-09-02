import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How XXF Tools handles converter input, shared note spaces, server logs, advertising and cookies",
  alternates: { canonical: "/privacy/" },
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <div className="legal-page__inner shell">
        <span className="kicker">Last updated September 2, 2026</span>
        <h1>Privacy Policy</h1>
        <p>XXF Tools is designed to minimize the data required to use its browser utilities. This page distinguishes local converters from the few features that intentionally use a network or stored shared space.</p>

        <h2>Browser-local converter data</h2>
        <p>Text entered into converter editors and files selected for image, collage or video conversion are processed by code running in your browser. That input is not intentionally transmitted to or stored on XXF servers. Avoid processing sensitive material on an untrusted or shared device.</p>
        <p>The redirect checker sends the public URL being tested to a restricted XXF endpoint so it can request the redirect chain. The M3U8 player connects from your browser to the stream host you enter. Those network tools cannot offer the same no-request behavior as a text converter.</p>

        <h2>Shared note spaces</h2>
        <p>Pages under <code>/n/</code> are an explicit exception to browser-local processing. Their text is transmitted to XXF storage and automatically saved so the same named space can be opened again. Anyone who knows or guesses the space link can access its content, so shared spaces must not contain passwords, access tokens, personal records, private source code or confidential business information.</p>

        <h2>Server logs and infrastructure</h2>
        <p>Infrastructure providers may process basic request information such as IP address, browser type, requested URL, response status and timestamps for security, reliability and aggregate traffic measurement. Converter editor contents are not part of ordinary page requests, except for the network and shared-space features described above.</p>

        <h2>Google advertising and cookies</h2>
        <p>XXF includes Google AdSense advertising code. When Google advertising services are active, a visitor&apos;s browser may send Google information such as the page URL and IP address, and Google or its partners may set or read advertising cookies. Third-party vendors, including Google, may use cookies to serve ads informed by a visitor&apos;s previous visits to this site or other sites. Google uses this information to deliver services, measure advertising, protect against fraud and, depending on the visitor&apos;s settings and consent, personalize ads.</p>
        <p>Google explains this processing in <a className="text-link" href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noreferrer">How Google uses information from sites or apps that use its services ↗</a>. Visitors can review or change ad personalization through <a className="text-link" href="https://adssettings.google.com/" target="_blank" rel="noreferrer">Google Ads Settings ↗</a>. Other advertising vendors may provide their own controls where their services are used.</p>

        <h2>Your choices</h2>
        <p>You can use the converters without creating an XXF account, clear browser site data, block cookies through browser settings and avoid shared spaces or network tools. Blocking some requests may prevent advertising, stream playback or network-dependent features from working.</p>

        <h2>Questions and corrections</h2>
        <p>Use the <Link className="text-link" href="/contact/">contact and feedback page</Link> to report a privacy-documentation error or ask a question about the behavior described here.</p>
      </div>
    </main>
  );
}
