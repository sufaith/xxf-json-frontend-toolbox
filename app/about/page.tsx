import type { Metadata } from "next";
import Link from "next/link";
import { AdSenseScript } from "@/components/AdSenseScript";

export const metadata: Metadata = {
  title: "About XXF Tools",
  description: "Who maintains XXF Tools and how its private browser utilities and technical guidance are built and reviewed",
  alternates: { canonical: "/about/" },
};

export default function AboutPage() {
  return (
    <main className="legal-page">
      <AdSenseScript />
      <div className="legal-page__inner shell">
        <span className="kicker">Maintained by XXF Tools · Reviewed September 2, 2026</span>
        <h1>Useful conversions, explained</h1>
        <p>XXF Tools is a focused collection of browser-based utilities for the small transformations that interrupt frontend work: formatting JSON, generating types, translating data formats, decoding text and preparing media.</p>
        <h2>Private by architecture</h2>
        <p>Text, image and video transformations run on your device. Converter input is not uploaded to an XXF processing API, stored in an account or reviewed by us. The redirect checker sends only the public URL being tested to its restricted server endpoint, while the M3U8 player connects directly to the stream host.</p>
        <h2>Maintained with the implementation</h2>
        <p>The XXF Tools editorial team maintains the interfaces, transformation code and explanatory content in one public project. Tool instructions are checked against the current implementation, and every worked example uses synthetic input that a visitor can reproduce without an account or private data.</p>
        <p>The <Link className="text-link" href="/editorial-policy/">editorial standards page</Link> explains the review checklist, source hierarchy, correction process and separation between advertising and technical guidance.</p>
        <h2>Review before production</h2>
        <p>Generated code, schemas and converted data are starting points. Samples cannot reveal every optional field, domain rule, parser difference or security requirement, so XXF keeps source and output visible and calls out decisions that require human review.</p>
        <h2>Independent and inspectable</h2>
        <p>XXF is free to use without registration. Advertising may support hosting and maintenance, but tool access is not gated behind an account and advertisers do not choose editorial conclusions.</p>
        <p>The implementation and documentation history are available in the <a className="text-link" href="https://github.com/sufaith/xxf-json-frontend-toolbox" target="_blank" rel="noreferrer">public source repository</a>. Bugs and documentation corrections can be submitted through the <Link className="text-link" href="/contact/">contact and feedback page</Link>.</p>
      </div>
    </main>
  );
}
