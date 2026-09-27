export type Guide = {
  slug: string;
  title: string;
  description: string;
  readTime: string;
  updated: string;
  topic: "JSON" | "Data formats" | "Web platform" | "Images" | "Video" | "Security";
  relatedTools: string[];
  references: Array<{ title: string; publisher: string; url: string }>;
  sections: Array<{ heading: string; paragraphs: string[]; bullets?: string[] }>;
};

export const guides: Guide[] = [
  {
    slug: "how-to-format-and-validate-json",
    title: "How to format and validate JSON without leaking data",
    description:
      "A practical workflow for reading unfamiliar JSON, finding syntax errors and keeping sensitive payloads on your device.",
    readTime: "6 min read",
    updated: "2026-09-01",
    topic: "JSON",
    relatedTools: ["json-formatter", "json-validator", "json-minifier", "json-key-sorter"],
    references: [
      { title: "The JavaScript Object Notation Data Interchange Format", publisher: "RFC Editor · RFC 8259", url: "https://www.rfc-editor.org/rfc/rfc8259" },
      { title: "JSON.parse()", publisher: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse" },
    ],
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
    updated: "2026-09-01",
    topic: "JSON",
    relatedTools: ["json-to-typescript", "json-to-zod", "json-to-json-schema"],
    references: [
      { title: "TypeScript for the New Programmer", publisher: "TypeScript Documentation", url: "https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html" },
      { title: "JSON Schema Draft 2020-12", publisher: "JSON Schema", url: "https://json-schema.org/draft/2020-12" },
    ],
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
    updated: "2026-09-01",
    topic: "Data formats",
    relatedTools: ["json-to-yaml", "yaml-to-json"],
    references: [
      { title: "YAML Ain't Markup Language Version 1.2.2", publisher: "YAML Language Development Team", url: "https://yaml.org/spec/1.2.2/" },
      { title: "The JavaScript Object Notation Data Interchange Format", publisher: "RFC Editor · RFC 8259", url: "https://www.rfc-editor.org/rfc/rfc8259" },
    ],
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
    updated: "2026-09-01",
    topic: "Data formats",
    relatedTools: ["json-to-csv", "csv-to-json", "json-to-html-table", "json-to-markdown-table"],
    references: [
      { title: "Common Format and MIME Type for CSV Files", publisher: "RFC Editor · RFC 4180", url: "https://www.rfc-editor.org/rfc/rfc4180" },
      { title: "CSV Injection", publisher: "OWASP", url: "https://owasp.org/www-community/attacks/CSV_Injection" },
    ],
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
    updated: "2026-09-01",
    topic: "Web platform",
    relatedTools: ["url-parser", "url-encoder-decoder", "base64-encoder-decoder", "html-entities"],
    references: [
      { title: "Uniform Resource Identifier: Generic Syntax", publisher: "RFC Editor · RFC 3986", url: "https://www.rfc-editor.org/rfc/rfc3986" },
      { title: "The Base16, Base32, and Base64 Data Encodings", publisher: "RFC Editor · RFC 4648", url: "https://www.rfc-editor.org/rfc/rfc4648" },
      { title: "HTML Living Standard · Character references", publisher: "WHATWG", url: "https://html.spec.whatwg.org/multipage/syntax.html#character-references" },
    ],
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
    updated: "2026-09-01",
    topic: "Security",
    relatedTools: ["jwt-decoder", "unix-timestamp-converter"],
    references: [
      { title: "JSON Web Token", publisher: "RFC Editor · RFC 7519", url: "https://www.rfc-editor.org/rfc/rfc7519" },
      { title: "JSON Web Token Best Current Practices", publisher: "RFC Editor · RFC 8725", url: "https://www.rfc-editor.org/rfc/rfc8725" },
    ],
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
  {
    slug: "diagnose-http-redirect-chains",
    title: "How to diagnose HTTP redirect chains without hiding the first mistake",
    description:
      "Read 301, 302, 307 and 308 responses correctly, shorten avoidable hops and test the destination seen by different clients.",
    readTime: "8 min read",
    updated: "2026-09-01",
    topic: "Web platform",
    relatedTools: ["redirect-checker", "url-parser"],
    references: [
      { title: "Building Protocols with HTTP · Redirection", publisher: "RFC Editor · RFC 9205", url: "https://www.rfc-editor.org/rfc/rfc9205.html#section-4.6.1" },
      { title: "HTTP Semantics · Redirection 3xx", publisher: "RFC Editor · RFC 9110", url: "https://www.rfc-editor.org/rfc/rfc9110.html#name-redirection-3xx" },
    ],
    sections: [
      {
        heading: "Start with the complete chain",
        paragraphs: [
          "A browser normally shows only the final page, which makes a redirect problem look like a destination problem. Record every hop from the first requested URL through the final non-redirect response, including status, Location value and whether the scheme or hostname changed.",
          "The first unnecessary hop is usually the best place to fix the chain. If http redirects to www and www redirects to the apex domain, combine those rules so the original request reaches the canonical HTTPS address in one step.",
        ],
      },
      {
        heading: "Choose permanence and method behavior deliberately",
        paragraphs: [
          "Permanent and temporary redirects communicate different intent to clients. Method behavior also matters: browsers commonly change POST to GET after 301 or 302, while 307 and 308 preserve the request method. A rule that looks interchangeable for GET navigation can behave differently for an API request or form submission.",
        ],
        bullets: ["301 is permanent and may change POST to GET", "302 is temporary and may change POST to GET", "307 is temporary and preserves the method", "308 is permanent and preserves the method"],
      },
      {
        heading: "Test more than one client view",
        paragraphs: [
          "Routing layers sometimes branch on user agent, language, geography, cookies or authentication. Compare a clean desktop request with a mobile request, then repeat in a real browser when JavaScript, service workers or session state may be involved.",
          "A server-side checker cannot reproduce every browser condition. Treat a clean HTTP chain as the baseline, then investigate client state only when the baseline is correct.",
        ],
      },
      {
        heading: "Finish with canonical consistency",
        paragraphs: [
          "The final URL, canonical link, sitemap entry and internal navigation should agree. Mixed signals force crawlers and visitors through avoidable work and make future migrations harder to reason about.",
        ],
        bullets: ["Use one preferred HTTPS hostname", "Update internal links instead of relying on redirects", "Avoid redirecting missing pages to the homepage", "Retest query strings and fragments after rule changes"],
      },
    ],
  },
  {
    slug: "map-json-and-xml-without-losing-meaning",
    title: "Mapping JSON and XML without losing attributes, order or meaning",
    description:
      "Understand the structural mismatch between JSON values and XML documents before converting feeds, legacy APIs and integration fixtures.",
    readTime: "8 min read",
    updated: "2026-09-01",
    topic: "Data formats",
    relatedTools: ["json-to-xml", "xml-to-json"],
    references: [
      { title: "Extensible Markup Language XML 1.0", publisher: "World Wide Web Consortium", url: "https://www.w3.org/TR/xml/" },
      { title: "The JavaScript Object Notation Data Interchange Format", publisher: "RFC Editor · RFC 8259", url: "https://www.rfc-editor.org/rfc/rfc8259" },
    ],
    sections: [
      {
        heading: "The two formats model different things",
        paragraphs: [
          "JSON has objects, arrays and primitive values. XML has elements, attributes, text nodes, namespaces and an ordered sequence of children. A converter must choose conventions because there is no universal one-to-one mapping between those models.",
          "A simple object with scalar properties maps cleanly. Difficult cases appear when an element contains both text and child elements, when repeated children imply an array, or when an attribute and child share the same local name.",
        ],
      },
      {
        heading: "Define attribute and array conventions",
        paragraphs: [
          "XXF prefixes XML attributes with an at sign in JSON so they remain distinct from child elements. When converting in the other direction, arrays become repeated elements under the array property name. These choices are readable, but the receiving system may use a different convention.",
        ],
        bullets: ["Document the attribute prefix", "Decide how empty elements map to null or empty strings", "Keep array order when sequence matters", "Choose an explicit root element"],
      },
      {
        heading: "Treat namespaces as data",
        paragraphs: [
          "Namespaces prevent collisions between vocabularies and often carry contract meaning. Removing prefixes because they look decorative can merge unrelated names or break schema validation. Preserve the namespace declarations required by the target integration.",
          "If the destination validates against an XSD or a published feed specification, test the converted document with that validator rather than relying on well-formedness alone.",
        ],
      },
      {
        heading: "Test a representative round trip",
        paragraphs: [
          "Build a small sample containing attributes, repeated children, empty values, Unicode text and the deepest nesting used in production. Convert it in both directions and compare the parsed meaning, not only the formatting.",
        ],
      },
    ],
  },
  {
    slug: "unix-timestamps-without-timezone-bugs",
    title: "Unix timestamps without seconds, milliseconds or timezone mistakes",
    description:
      "Distinguish an instant from its display timezone, detect thousand-fold unit errors and exchange dates with explicit ISO 8601 offsets.",
    readTime: "7 min read",
    updated: "2026-09-01",
    topic: "Web platform",
    relatedTools: ["unix-timestamp-converter", "jwt-decoder"],
    references: [
      { title: "Representing dates and times", publisher: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Representing_dates_times" },
      { title: "Date time string format", publisher: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format" },
    ],
    sections: [
      {
        heading: "A timestamp is an instant, not a timezone",
        paragraphs: [
          "Unix time counts from the beginning of 1 January 1970 UTC. The numeric value identifies an instant; local time appears only when software formats that instant for a timezone. Changing the display timezone should not change the underlying timestamp.",
          "Store instants in an unambiguous representation and apply a named business timezone only at the presentation or scheduling boundary.",
        ],
      },
      {
        heading: "Detect seconds and milliseconds",
        paragraphs: [
          "Many server APIs use seconds, while JavaScript Date values use milliseconds. Passing seconds directly to a millisecond API produces a date close to 1970; multiplying milliseconds by 1000 produces a far-future date.",
        ],
        bullets: ["Unix seconds currently use about ten digits", "Unix milliseconds currently use about thirteen digits", "Name fields with a unit suffix when possible", "Reject implausible ranges instead of silently guessing"],
      },
      {
        heading: "Prefer explicit date strings",
        paragraphs: [
          "When exchanging text dates, use ISO 8601 with Z or an explicit numeric offset. A local-looking value such as 2026-09-01T09:00:00 has no offset and may be interpreted in the runtime's local timezone.",
          "Date-only values such as a birthday are not instants. Model them as calendar dates instead of forcing them through midnight in a timezone.",
        ],
      },
      {
        heading: "Test daylight-saving boundaries",
        paragraphs: [
          "Scheduling systems need cases around daylight-saving gaps and repeated local hours. Compare the stored instant, the intended named timezone and the displayed local value, especially when a user edits an existing schedule.",
        ],
      },
    ],
  },
  {
    slug: "sha256-hashes-and-random-uuids",
    title: "SHA-256 hashes and UUIDv4 identifiers solve different problems",
    description:
      "Use deterministic digests for exact input comparison and random identifiers for distributed records without treating either value as a password or permission.",
    readTime: "8 min read",
    updated: "2026-09-01",
    topic: "Security",
    relatedTools: ["sha256-hash", "uuid-generator"],
    references: [
      { title: "Secure Hash Standard", publisher: "NIST · FIPS 180-4", url: "https://csrc.nist.gov/pubs/fips/180-4/upd1/final" },
      { title: "Universally Unique IDentifiers", publisher: "RFC Editor · RFC 9562", url: "https://www.rfc-editor.org/rfc/rfc9562.html" },
    ],
    sections: [
      {
        heading: "A hash describes input; a UUID names a record",
        paragraphs: [
          "SHA-256 deterministically maps the same byte sequence to the same 256-bit digest. UUIDv4 uses random or pseudorandom bits to create a 128-bit identifier with extremely low collision probability. One is content-derived; the other is intentionally independent of content.",
          "Choose a hash when identical normalized input should produce an identical value. Choose a UUID when separate clients need to create record identifiers without asking a central counter for the next number.",
        ],
      },
      {
        heading: "Byte-for-byte details matter for hashing",
        paragraphs: [
          "Text must be encoded into bytes before hashing. UTF-8 is a sensible default, but line endings, trailing whitespace and Unicode normalization can still change the digest. Document the exact preprocessing rules when two systems must agree.",
        ],
        bullets: ["Preserve or remove final newlines deliberately", "Agree on UTF-8", "Do not lowercase content unless the protocol requires it", "Compare lowercase and uppercase hex as representations of the same bytes"],
      },
      {
        heading: "Neither value grants security by itself",
        paragraphs: [
          "A UUID is not an authorization token merely because it is difficult to guess. A plain SHA-256 digest is not suitable for password storage because attackers can test guesses quickly. Access control still needs authenticated permission checks, and passwords need a slow salted password-hashing function.",
        ],
      },
      {
        heading: "Choose the UUID version for the data model",
        paragraphs: [
          "UUIDv4 is appropriate for random identifiers and is what the XXF generator creates. RFC 9562 also defines UUIDv7, which includes Unix-epoch time for sortable identifiers. Do not silently change versions when downstream systems validate a specific layout.",
        ],
      },
    ],
  },
  {
    slug: "prepare-images-for-the-web",
    title: "Prepare web images without guessing at format, quality or dimensions",
    description:
      "Choose PNG, JPEG or WebP based on the source, resize before delivery and judge compression at the actual display size.",
    readTime: "9 min read",
    updated: "2026-09-01",
    topic: "Images",
    relatedTools: ["image-compressor", "photo-collage-maker"],
    references: [
      { title: "Image file type and format guide", publisher: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types" },
      { title: "HTMLCanvasElement.toBlob()", publisher: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob" },
    ],
    sections: [
      {
        heading: "Start with the image's job",
        paragraphs: [
          "Photographs, interface screenshots, transparent illustrations and printable artwork have different compression needs. A format decision should follow the content and delivery target rather than a universal smallest-file rule.",
          "JPEG is a practical lossy choice for photographs, PNG preserves exact pixels and transparency, and WebP can provide lossy or lossless output with broad modern-browser support.",
        ],
      },
      {
        heading: "Resize before tuning quality",
        paragraphs: [
          "Sending a 4000-pixel image into a 600-pixel card wastes decoding work even if the file is aggressively compressed. Export near the largest rendered size needed for the target density, then compare compression settings.",
        ],
        bullets: ["Keep the original master", "Set a deliberate maximum width and height", "Preview text and sharp edges at 100 percent", "Avoid repeatedly recompressing a lossy derivative"],
      },
      {
        heading: "Judge quality visually and numerically",
        paragraphs: [
          "A quality slider is encoder input, not a universal percentage score. Compare the source and result at the size users will see, paying attention to gradients, faces, small text and high-contrast edges.",
          "Smart selection should keep the original when re-encoding makes the file larger. File size savings are useful only when the result still serves its visual purpose.",
        ],
      },
      {
        heading: "Compose collages for hierarchy",
        paragraphs: [
          "When combining images, pick one focal frame, use consistent gaps and crop secondary images to support the story. Confirm the final aspect ratio before annotating because a later crop can remove labels or watermarks.",
          "Browser canvas export creates a new rendered file and may omit source metadata. That can be desirable for privacy, but the original files remain the authoritative archive.",
        ],
      },
    ],
  },
  {
    slug: "understand-m3u8-hls-playback",
    title: "Understand M3U8 playlists before debugging HLS playback",
    description:
      "Separate master playlists, media playlists and segments, then check codecs, CORS, MIME types and adaptive variants in the right order.",
    readTime: "10 min read",
    updated: "2026-09-01",
    topic: "Video",
    relatedTools: ["m3u8-player", "video-to-m3u8"],
    references: [
      { title: "HTTP Live Streaming", publisher: "RFC Editor · RFC 8216", url: "https://www.rfc-editor.org/rfc/rfc8216.html" },
      { title: "HTTP Live Streaming overview", publisher: "Apple Developer", url: "https://developer.apple.com/streaming/" },
    ],
    sections: [
      {
        heading: "Know which playlist you opened",
        paragraphs: [
          "An HLS master playlist lists variant streams and optional renditions such as alternate audio. A media playlist lists the segments for one stream. Both commonly use the m3u8 extension, so inspect the tags before assuming what the URL represents.",
          "Adaptive playback requires multiple encoded renditions and a master playlist that describes their bandwidth and codecs. A single media playlist can play successfully but cannot switch quality levels by itself.",
        ],
      },
      {
        heading: "Debug in dependency order",
        paragraphs: [
          "Start with the playlist response, then follow the exact segment URLs it contains. Relative paths resolve against the playlist URL, and every playlist, key and segment must be reachable by the browser under the required cross-origin policy.",
        ],
        bullets: ["Confirm an HTTP 200 response", "Use the expected HLS MIME type", "Check CORS on playlists, keys and segments", "Verify that the browser supports the encoded audio and video codecs"],
      },
      {
        heading: "Native and scripted playback differ",
        paragraphs: [
          "Safari commonly plays HLS through native media support. Other modern browsers generally use Media Source Extensions through a JavaScript HLS engine. The two paths can expose different error messages and codec limits, so test both when broad compatibility matters.",
        ],
      },
      {
        heading: "Use browser conversion for prototypes",
        paragraphs: [
          "A browser-based FFmpeg workflow is useful for short local tests and for learning package structure. Long videos, adaptive ladders, encryption and production-scale throughput belong in a native encoding pipeline with measured bitrate, keyframe and segment settings.",
          "Upload the playlist and every segment together, preserve their relative paths and test through HTTPS from the same kind of origin policy used in production.",
        ],
      },
    ],
  },
  {
    slug: "format-and-minify-css-safely",
    title: "Format and minify CSS without changing the stylesheet's meaning",
    description:
      "Use readable formatting for diagnosis, conservative minification for delivery and parser-based tooling when modern CSS syntax becomes complex.",
    readTime: "8 min read",
    updated: "2026-09-01",
    topic: "Web platform",
    relatedTools: ["css-formatter-minifier", "color-converter"],
    references: [
      { title: "CSS Syntax Module Level 3", publisher: "World Wide Web Consortium", url: "https://www.w3.org/TR/css-syntax-3/" },
      { title: "Web Content Accessibility Guidelines · Contrast", publisher: "World Wide Web Consortium", url: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html" },
    ],
    sections: [
      {
        heading: "Formatting is a debugging aid",
        paragraphs: [
          "Readable line breaks and indentation reveal selector boundaries, declaration blocks and missing closing braces. Formatting should preserve token meaning rather than reorder declarations or combine rules that may depend on the cascade.",
          "When diagnosing generated CSS, keep the original asset and compare the rendered page after formatting. A readable result is not proof that invalid or unsupported declarations became valid.",
        ],
      },
      {
        heading: "Minify conservatively",
        paragraphs: [
          "Whitespace and comments are often removable, but CSS contains strings, escaped identifiers, custom properties and data URLs where simple regular-expression rewrites can be risky. The XXF tool intentionally avoids aggressive value rewriting and selector merging.",
        ],
        bullets: ["Keep the authored source under version control", "Minify a build artifact, not the only copy", "Test data URLs and custom properties", "Use source maps in production debugging workflows"],
      },
      {
        heading: "Use a parser for production optimization",
        paragraphs: [
          "A parser-based tool understands CSS tokens and is better suited to merging rules, shortening values, removing unreachable code or handling new syntax. Run the project's browser tests after changing optimizer versions because valid transformations can still expose cascade assumptions.",
        ],
      },
      {
        heading: "Color conversion does not measure contrast",
        paragraphs: [
          "HEX, RGB and HSL are representations of color values, not accessibility scores. Rounding during conversion can slightly change numeric values, and acceptable text contrast depends on the foreground-background pair, font size and weight.",
          "Use the converter to normalize design tokens, then evaluate contrast in the final component state, including hover, disabled and dark-mode combinations.",
        ],
      },
    ],
  },
];

export const guideMap = new Map(guides.map((guide) => [guide.slug, guide]));
export const guideTopics = [...new Set(guides.map((guide) => guide.topic))];
