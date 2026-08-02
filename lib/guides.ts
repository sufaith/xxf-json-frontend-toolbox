export type Guide = {
  slug: string;
  title: string;
  description: string;
  readTime: string;
  updated: string;
  sections: Array<{ heading: string; paragraphs: string[]; bullets?: string[] }>;
};

export const guides: Guide[] = [
  {
    slug: "how-to-format-and-validate-json",
    title: "How to format and validate JSON without leaking data",
    description:
      "A practical workflow for reading unfamiliar JSON, finding syntax errors and keeping sensitive payloads on your device.",
    readTime: "6 min read",
    updated: "2026-08-02",
    sections: [
      {
        heading: "Format before you debug",
        paragraphs: [
          "Minified API responses hide structure. Pretty-printing adds indentation and line breaks without changing values, making nested objects and arrays easier to scan.",
          "A formatter should parse before it prints. If parsing fails, fix the first reported syntax error before chasing later messages because one missing quote or comma can shift the rest of the document.",
        ],
      },
      {
        heading: "Common JSON syntax failures",
        paragraphs: ["Strict JSON is smaller than JavaScript object syntax. It rejects several conveniences developers often type from habit."],
        bullets: [
          "Property names must use double quotes.",
          "Strings must use double quotes, not single quotes.",
          "Trailing commas are not allowed.",
          "Comments, undefined, NaN and functions are not JSON values.",
        ],
      },
      {
        heading: "Protect production payloads",
        paragraphs: [
          "Authentication tokens, customer records and unreleased API responses should not be pasted into tools that send data to a server. Prefer converters that operate locally and confirm the browser network panel stays quiet when your data is sensitive.",
        ],
      },
    ],
  },
  {
    slug: "json-to-typescript-workflow",
    title: "From JSON response to safe TypeScript types",
    description:
      "Generate a useful first draft from real API data, then harden it for nullability, optional fields and changing backend responses.",
    readTime: "7 min read",
    updated: "2026-08-02",
    sections: [
      {
        heading: "Start with representative data",
        paragraphs: [
          "Type inference is only as complete as the sample. Include empty arrays, nullable properties and multiple variants when possible so a generator can see the shapes your frontend must handle.",
        ],
      },
      {
        heading: "Separate static types from runtime validation",
        paragraphs: [
          "TypeScript types disappear at runtime. They help editors and builds, but cannot prove that a network response is valid. Use a runtime schema such as Zod at untrusted boundaries, then infer the TypeScript type from that schema when appropriate.",
        ],
        bullets: [
          "Generate interfaces for developer ergonomics.",
          "Validate external input before trusting it.",
          "Model nullable and optional fields deliberately.",
          "Keep API DTOs separate from UI view models.",
        ],
      },
      {
        heading: "Review generated unions",
        paragraphs: [
          "Mixed arrays can produce broad unions. That output is safer than silently choosing the first item, but it may indicate inconsistent source data that deserves a backend contract.",
        ],
      },
    ],
  },
  {
    slug: "json-vs-yaml-for-configuration",
    title: "JSON vs YAML: choosing a configuration format",
    description:
      "Compare strict machine-friendly JSON with concise human-edited YAML and convert safely between the two.",
    readTime: "5 min read",
    updated: "2026-08-02",
    sections: [
      {
        heading: "Choose for the people editing it",
        paragraphs: [
          "JSON has a small grammar and predictable parsers. YAML is easier to scan in large configuration files but includes more syntax and type inference rules.",
        ],
      },
      {
        heading: "Where JSON fits best",
        paragraphs: ["JSON is a strong default for APIs, generated artifacts, package metadata and data exchanged across languages."],
        bullets: ["Universal parser support", "Unambiguous braces and brackets", "Straightforward schema validation", "Reliable round trips"],
      },
      {
        heading: "Where YAML fits best",
        paragraphs: [
          "YAML works well for configuration maintained by people: deployment manifests, automation workflows and settings with long block strings. Quote values that could be interpreted as dates or booleans, and validate after conversion.",
        ],
      },
    ],
  },
  {
    slug: "convert-json-and-csv-safely",
    title: "How to convert JSON and CSV without broken rows",
    description:
      "Handle headers, nested objects, quoted commas and spreadsheet-oriented data shapes predictably.",
    readTime: "6 min read",
    updated: "2026-08-02",
    sections: [
      {
        heading: "Use records, not arbitrary trees",
        paragraphs: [
          "CSV is a rectangular table. The cleanest JSON input is an array of objects with mostly consistent keys. Deeply nested data should be flattened intentionally or serialized inside a cell.",
        ],
      },
      {
        heading: "Respect CSV quoting",
        paragraphs: [
          "A production CSV parser must handle commas inside quoted fields, doubled quote escapes and line breaks inside cells. Splitting lines and commas manually fails on real exports.",
        ],
        bullets: ["Treat the first row as headers when importing", "Preserve empty values", "Use UTF-8", "Review spreadsheet formula risks before sharing untrusted data"],
      },
      {
        heading: "Validate the round trip",
        paragraphs: [
          "Convert a small representative sample in both directions and compare row counts, headers and special characters before processing a large dataset.",
        ],
      },
    ],
  },
  {
    slug: "frontend-encoding-cheat-sheet",
    title: "Frontend encoding cheat sheet: URL, Base64 and HTML entities",
    description:
      "Know which encoding belongs in URLs, transport wrappers and HTML text—and which problems encoding cannot solve.",
    readTime: "8 min read",
    updated: "2026-08-02",
    sections: [
      {
        heading: "URL encoding",
        paragraphs: [
          "Use percent encoding for individual URL path segments and query values. encodeURIComponent protects reserved separators inside a value, while URL APIs are usually better for assembling a complete URL.",
        ],
      },
      {
        heading: "Base64 is transport encoding, not encryption",
        paragraphs: [
          "Base64 represents bytes with printable characters. Anyone can decode it, so it provides no secrecy. Use it for binary-to-text transport only when the surrounding protocol expects it.",
        ],
      },
      {
        heading: "HTML entities protect text contexts",
        paragraphs: [
          "Encode ampersands and angle brackets before placing untrusted text into HTML. Context matters: HTML text, attributes, URLs, CSS and JavaScript each need appropriate handling, so prefer framework escaping over manual string assembly.",
        ],
      },
    ],
  },
  {
    slug: "debug-jwt-tokens-safely",
    title: "How to inspect JWT tokens safely",
    description:
      "Decode headers and claims without confusing readable payloads with verified identity or authorization.",
    readTime: "6 min read",
    updated: "2026-08-02",
    sections: [
      {
        heading: "A JWT is three segments",
        paragraphs: [
          "Most signed JWTs contain a Base64URL-encoded header, a Base64URL-encoded payload and a signature separated by periods. The first two segments are readable, not encrypted.",
        ],
      },
      {
        heading: "Decoding is not verification",
        paragraphs: [
          "A decoder can display claims but cannot prove who issued them. Verification must check the signature, allowed algorithm, issuer, audience and time-based claims with trusted key material.",
        ],
        bullets: ["Never grant access based on decoded text alone", "Reject unexpected algorithms", "Check exp and nbf", "Avoid pasting production tokens into server-backed websites"],
      },
      {
        heading: "Debug with minimal exposure",
        paragraphs: [
          "Use short-lived development tokens, redact identifiers in screenshots and prefer a local browser decoder when a real token must be inspected.",
        ],
      },
    ],
  },
];

export const guideMap = new Map(guides.map((guide) => [guide.slug, guide]));
