export type ToolEditorial = {
  overview: string[];
  steps: string[];
  useCases: string[];
  notes: string[];
  guideSlugs: string[];
};

export const toolEditorial: Record<string, ToolEditorial> = {
  "url-parser": {
    overview: [
      "A URL can contain several independent pieces of state: the scheme, host, port, path, fragment and a query string with repeated or encoded values. Reading the whole address as one line makes tracking links and callback URLs unnecessarily hard to debug.",
      "This parser separates those components and lets you inspect query parameters individually. When a parameter contains another encoded URL, expand it to follow the nested value without repeatedly decoding the entire address.",
    ],
    steps: [
      "Paste a complete absolute URL, including its http or https scheme",
      "Review the origin, path, fragment and decoded query-parameter table",
      "Expand nested URL values and copy only the component needed for testing",
    ],
    useCases: ["Audit analytics and campaign parameters before publishing a link", "Debug OAuth callback, return-to and deep-link URLs", "Compare nested redirect targets without changing the original address"],
    notes: ["Parsing describes the URL; it does not request the destination or prove that the address is safe", "Repeated query keys can be meaningful, so review every occurrence before rewriting a link"],
    guideSlugs: ["frontend-encoding-cheat-sheet"],
  },
  "redirect-checker": {
    overview: [
      "Redirect problems often hide behind a final page that appears normal. A chain may include temporary redirects, an unnecessary www hop, a mobile-only destination or a loop that search crawlers and browsers handle differently.",
      "The checker requests the address through XXF's restricted redirect endpoint and records each HTTP hop. The desktop and mobile user-agent choices help expose routing rules that depend on the requesting browser.",
    ],
    steps: ["Enter a public http or https URL", "Choose the desktop or mobile user agent and run the check", "Review every status code, destination and the final response before changing server rules"],
    useCases: ["Confirm an HTTP-to-HTTPS or www-to-apex migration", "Find long redirect chains that waste crawl time", "Compare desktop and mobile routing for the same landing page"],
    notes: ["Private, loopback and local-network destinations are blocked to protect the service", "A browser may still behave differently when cookies, authentication or JavaScript navigation are involved"],
    guideSlugs: [],
  },
  "json-formatter": {
    overview: [
      "Formatting turns compact JSON into an indented document without changing property names, values or array order. The result is easier to scan in bug reports, API logs and code review.",
      "XXF parses the input before formatting it, so malformed JSON produces an error instead of a misleading best-effort result. Choose two or four spaces and decide whether escaped Unicode sequences should remain encoded.",
    ],
    steps: ["Paste strict JSON or load the included representative sample", "Choose the indentation and escape-display options", "Inspect the structure, then copy or download the formatted JSON"],
    useCases: ["Read a minified API response", "Prepare a stable fixture for a test", "Locate a missing quote, comma or closing bracket"],
    notes: ["JSON does not allow comments, trailing commas, single-quoted strings or undefined", "Formatting is not schema validation and cannot confirm that field values match business rules"],
    guideSlugs: ["how-to-format-and-validate-json"],
  },
  "json-validator": {
    overview: [
      "A syntactically valid JSON document must follow a small but strict grammar. This validator parses the complete input and summarizes its root type, nesting depth and primitive counts so you can distinguish syntax problems from unexpected structure.",
      "The report is useful before importing a payload into another system, but it intentionally does not assume a domain schema. A valid document can still contain missing, mistyped or out-of-range application data.",
    ],
    steps: ["Paste the exact JSON received or about to be sent", "Run validation and fix the first reported syntax location", "Review root type, depth and value counts for unexpected structure"],
    useCases: ["Check copied configuration before deployment", "Separate transport syntax errors from application validation errors", "Compare the shape of two API samples"],
    notes: ["Fix the first syntax error before interpreting later positions", "Use JSON Schema, Zod or application code when field-level constraints also matter"],
    guideSlugs: ["how-to-format-and-validate-json"],
  },
  "json-minifier": {
    overview: [
      "JSON minification removes indentation and insignificant whitespace after parsing the document. Strings and values remain intact, while the serialized result is smaller for transport, embedding or snapshot storage.",
      "Because the input is parsed first, this tool also catches invalid JSON instead of compressing broken syntax. The byte counters make the whitespace savings visible before you replace an existing asset.",
    ],
    steps: ["Paste valid formatted JSON", "Minify the document and compare input and output byte counts", "Copy or download the compact result and keep the readable source under version control"],
    useCases: ["Reduce a static JSON asset", "Create a compact request example", "Remove formatting noise from a generated payload"],
    notes: ["HTTP compression usually saves more bandwidth than whitespace removal alone", "Minification does not rename keys, deduplicate data or hide sensitive values"],
    guideSlugs: ["how-to-format-and-validate-json"],
  },
  "json-key-sorter": {
    overview: [
      "Sorting object keys creates deterministic JSON that is easier to compare across builds and environments. XXF sorts keys recursively while preserving the order of array items, where position often carries meaning.",
      "The result is best used for fixtures, snapshots and human review. Applications should not rely on object-property order as a business rule, even though modern runtimes preserve a defined enumeration order in many cases.",
    ],
    steps: ["Paste a valid JSON value containing one or more objects", "Sort keys and choose the preferred indentation", "Compare the output before replacing a fixture or snapshot"],
    useCases: ["Stabilize test snapshots", "Reduce noisy configuration diffs", "Compare API objects produced by different systems"],
    notes: ["Arrays keep their original order", "Locale-aware alphabetical order may differ from a bytewise canonicalization specification"],
    guideSlugs: ["how-to-format-and-validate-json"],
  },
  "json-to-typescript": {
    overview: [
      "A real JSON response is a useful starting point for TypeScript types because it exposes nested objects, arrays and primitive values. The generator builds readable interfaces from the supplied sample and uses unions when array members have different observed shapes.",
      "Generated declarations describe only the evidence in that sample. Fields absent from the sample cannot be discovered, and a null value does not reveal the non-null type it may hold later.",
    ],
    steps: ["Paste a representative JSON response with realistic optional and nullable cases", "Generate the interfaces and inspect nested names and unions", "Adjust domain names and optional fields before adding the types to a project"],
    useCases: ["Bootstrap types for an unfamiliar API", "Document fixture shapes during frontend integration", "Spot inconsistent values inside mixed arrays"],
    notes: ["TypeScript types disappear at runtime and do not validate network data", "Use multiple representative samples or an authoritative API schema for production contracts"],
    guideSlugs: ["json-to-typescript-workflow"],
  },
  "json-to-zod": {
    overview: [
      "Zod schemas validate unknown data at runtime and can also produce TypeScript types. XXF infers nested objects, arrays, primitive values and simple unions from one JSON example, then returns a schema and its inferred Root type.",
      "Inference cannot decide business constraints such as valid email formats, numeric ranges or whether a missing property is optional. Treat the output as a reviewable foundation rather than a final security boundary.",
    ],
    steps: ["Paste a representative JSON value", "Generate the Zod schema and review every inferred branch", "Add optional, nullable, format and range rules required by the real contract"],
    useCases: ["Create a parser for an external API response", "Validate imported configuration", "Prototype form or webhook payload schemas"],
    notes: ["Empty arrays become arrays of unknown values because no item evidence exists", "A null sample becomes z.null and needs manual expansion when other values are possible"],
    guideSlugs: ["json-to-typescript-workflow"],
  },
  "json-to-json-schema": {
    overview: [
      "JSON Schema can document and validate data independently of a particular programming language. This generator emits Draft 2020-12 structure, required properties and array item schemas from the example you provide.",
      "Every observed object property is marked required and additional properties are disabled in the generated starting point. Review those choices against the actual producer before publishing the schema as a contract.",
    ],
    steps: ["Paste a representative JSON document", "Generate the Draft 2020-12 schema", "Review required fields, additionalProperties and anyOf branches before validation use"],
    useCases: ["Start documentation for an internal API", "Create validation fixtures for an integration", "Describe configuration files shared across languages"],
    notes: ["Formats, descriptions, numeric limits and string patterns require domain knowledge and are not inferred", "Mixed arrays generate anyOf item alternatives that may need simplification"],
    guideSlugs: ["json-to-typescript-workflow"],
  },
  "json-to-yaml": {
    overview: [
      "YAML is often easier for people to edit in deployment and automation files, while JSON is common at API boundaries. This converter parses the JSON first and emits readable YAML without aliases or references.",
      "Objects, arrays, numbers, booleans and null values are represented with corresponding YAML types. Review quoted strings when downstream YAML parsers use different schema rules.",
    ],
    steps: ["Paste valid JSON", "Convert and inspect indentation, arrays and quoted scalar values", "Validate the YAML with the target application before replacing configuration"],
    useCases: ["Draft deployment configuration from an API example", "Translate package data into human-edited settings", "Compare JSON and YAML representations during documentation"],
    notes: ["Comments cannot be created because JSON contains no comment information", "A round trip may change formatting even when the parsed data remains equivalent"],
    guideSlugs: ["json-vs-yaml-for-configuration"],
  },
  "yaml-to-json": {
    overview: [
      "Converting YAML to JSON makes the parsed structure explicit with braces, brackets and quoted property names. XXF uses a standards-based YAML parser and returns consistently indented JSON for inspection or machine use.",
      "YAML supports features that have no direct formatting equivalent in JSON, including comments, anchors and multiple scalar styles. The resolved data is preserved, but those authoring details are not.",
    ],
    steps: ["Paste a complete YAML document", "Convert and resolve any reported syntax error", "Review inferred scalar types before using the JSON in another system"],
    useCases: ["Inspect CI or deployment configuration as explicit data", "Feed a YAML example into JSON-oriented tooling", "Check how quoted and unquoted scalar values are interpreted"],
    notes: ["Comments and original anchor names are not represented in JSON", "Always validate security-sensitive configuration with the application that will consume it"],
    guideSlugs: ["json-vs-yaml-for-configuration"],
  },
  "json-to-csv": {
    overview: [
      "CSV represents a rectangular table, while JSON can hold arbitrary trees. This converter expects an array of objects, builds a union of their keys and safely quotes values for spreadsheet-oriented export.",
      "Nested objects and arrays are serialized as compact JSON within a cell. That preserves the value for inspection but does not flatten it into additional columns.",
    ],
    steps: ["Paste an array of similarly shaped JSON objects", "Convert and verify headers, row count and quoted values", "Download the CSV and test a representative sample in the destination spreadsheet"],
    useCases: ["Share API records with non-developer teammates", "Prepare a small data extract for spreadsheet analysis", "Turn test fixtures into importable rows"],
    notes: ["Deeply nested records usually need a deliberate flattening strategy", "Treat cells beginning with spreadsheet formula characters as untrusted when sharing imported data"],
    guideSlugs: ["convert-json-and-csv-safely"],
  },
  "csv-to-json": {
    overview: [
      "CSV looks simple until fields contain commas, quotes or line breaks. XXF uses a CSV parser with header detection and quoted-field support, then returns one JSON object per data row.",
      "CSV has no universal type metadata, so imported cell values remain strings unless your application applies an explicit schema afterward. Empty rows are skipped while empty cells are preserved.",
    ],
    steps: ["Paste UTF-8 CSV with a header row", "Convert and inspect parser errors, row count and property names", "Apply application-specific number, date and boolean parsing after export"],
    useCases: ["Prepare spreadsheet exports for an API", "Inspect quoted multiline fields", "Create JSON fixtures from a small tabular dataset"],
    notes: ["Duplicate or blank headers can produce ambiguous objects", "Do not assume values such as 00123, true or dates have the intended type without a schema"],
    guideSlugs: ["convert-json-and-csv-safely"],
  },
  "json-to-xml": {
    overview: [
      "XML models elements and attributes differently from JSON objects and arrays. This converter builds a well-formed XML document from nested JSON and repeats elements for array members.",
      "The generated structure is suitable as a starting point for feeds and legacy integrations, but the receiving system may require a particular root element, namespaces or attribute conventions.",
    ],
    steps: ["Paste valid JSON with a clear root object", "Convert and inspect repeated array elements", "Add any required namespaces, attributes or schema-specific wrapper elements"],
    useCases: ["Prototype a legacy API payload", "Create readable XML from internal JSON data", "Compare tree structure during a format migration"],
    notes: ["JSON keys must be valid or transformable XML element names for the target system", "XML schemas, namespaces and mixed text content require manual domain-specific work"],
    guideSlugs: [],
  },
  "xml-to-json": {
    overview: [
      "XML documents can combine nested elements, repeated nodes, attributes and text content. XXF parses that structure into readable JSON and prefixes attributes with @ so they remain distinct from child elements.",
      "The conversion exposes data conveniently for JavaScript work, but XML ordering, namespaces and mixed-content semantics may require a dedicated model in strict integrations.",
    ],
    steps: ["Paste a complete XML document", "Convert and inspect attributes, repeated children and text nodes", "Compare the result with the source schema before using it as an API contract"],
    useCases: ["Inspect an XML API response", "Prepare legacy feed data for frontend code", "Build a fixture while migrating an integration"],
    notes: ["Whitespace and mixed text-and-element content may not map cleanly to a simple JSON object", "Do not discard namespace meaning when element names overlap"],
    guideSlugs: [],
  },
  "json-to-html-table": {
    overview: [
      "A semantic HTML table needs a header row, consistent columns and escaped cell content. XXF derives the complete set of headers from an array of JSON records and emits thead, tbody and scoped th markup.",
      "Nested values are shown as compact JSON strings rather than silently flattened. The generated markup contains no site-specific styling so it can enter an existing design system cleanly.",
    ],
    steps: ["Paste an array of JSON objects", "Generate the table and review column order and empty cells", "Add a caption, responsive wrapper and project styles appropriate to the final page"],
    useCases: ["Prototype an admin data table", "Turn fixture data into documentation markup", "Create a static comparison table from API records"],
    notes: ["Cell text is escaped, but the surrounding application still needs its normal security controls", "Large datasets need pagination or virtualization instead of a single static table"],
    guideSlugs: ["convert-json-and-csv-safely"],
  },
  "json-to-markdown-table": {
    overview: [
      "Markdown tables are convenient for READMEs, issue reports and technical notes. This converter uses object keys as headers and escapes pipes and line breaks so common Markdown renderers keep each value in the intended cell.",
      "Nested objects and arrays are represented as compact JSON strings. Review very wide tables because documentation is often clearer when complex records are split into smaller focused tables.",
    ],
    steps: ["Paste an array of JSON objects", "Generate Markdown and inspect headers and escaped values", "Preview the result in the target renderer before publishing"],
    useCases: ["Document API examples in a repository", "Create a quick feature or configuration matrix", "Paste structured results into an issue or pull request"],
    notes: ["Markdown table syntax varies slightly between renderers", "Multiline and deeply nested values are usually easier to read outside a table"],
    guideSlugs: ["convert-json-and-csv-safely"],
  },
  "url-encoder-decoder": {
    overview: [
      "Percent encoding protects reserved characters when text becomes one component of a URL. This tool applies component encoding, which is appropriate for a query value or path segment rather than an entire address.",
      "Unicode text is converted safely, and decoding reverses valid percent sequences. Keeping the scheme, host and structural separators outside the input avoids encoding characters that define the URL itself.",
    ],
    steps: ["Choose Encode for raw text or Decode for an encoded component", "Paste one query value or path segment", "Convert, then insert the result with a URL API rather than string concatenation"],
    useCases: ["Encode search terms containing spaces or ampersands", "Inspect a callback parameter copied from a browser", "Prepare Unicode text for a query value"],
    notes: ["Encoding is not encryption and does not conceal data", "Do not repeatedly decode untrusted input without knowing how many encoding layers are expected"],
    guideSlugs: ["frontend-encoding-cheat-sheet"],
  },
  "base64-encoder-decoder": {
    overview: [
      "Base64 represents bytes with printable ASCII characters for transport through text-oriented systems. XXF converts text through UTF-8 first, so Chinese characters, emoji and other Unicode content round-trip correctly.",
      "The output is larger than the original bytes and provides no confidentiality. Use it for representation and interoperability, not for passwords, secrets or access control.",
    ],
    steps: ["Choose Encode for UTF-8 text or Decode for Base64", "Paste the value and run the conversion", "Verify the decoded text before using it in a configuration or request"],
    useCases: ["Inspect a Base64-encoded configuration value", "Create a small data URI component", "Verify Unicode handling across an integration"],
    notes: ["Base64 is reversible and must never be treated as encryption", "Binary files may not decode to valid UTF-8 text and are outside this text-focused tool"],
    guideSlugs: ["frontend-encoding-cheat-sheet"],
  },
  "html-entities": {
    overview: [
      "HTML entities let reserved markup characters appear as text. The encoder protects ampersands, angle brackets and quotes, while the decoder turns named or numeric entities back into readable characters.",
      "Entity encoding is context-specific. Escaping text for an HTML text node is not automatically sufficient for JavaScript, CSS, URL or every attribute context.",
    ],
    steps: ["Choose Encode or Decode", "Paste the exact text fragment rather than an entire untrusted document", "Review the result in the destination context before rendering"],
    useCases: ["Show a code fragment inside documentation", "Decode copied CMS or feed text", "Prepare a literal ampersand or angle bracket for HTML text"],
    notes: ["Use framework escaping and trusted sanitizers when rendering untrusted HTML", "Encoding does not make arbitrary markup safe to execute"],
    guideSlugs: ["frontend-encoding-cheat-sheet"],
  },
  "jwt-decoder": {
    overview: [
      "A JSON Web Token usually contains a Base64URL-encoded header and payload plus a signature. Decoding exposes the readable claims for debugging, but it does not verify who created the token or whether its contents can be trusted.",
      "XXF decodes locally so the token is not sent to an inspection service. Even so, avoid copying live credentials unnecessarily and revoke any secret accidentally shared elsewhere.",
    ],
    steps: ["Paste the complete three-part token", "Decode and inspect the algorithm, issuer, audience and time claims", "Verify the signature and claim rules in trusted server-side code before authorization"],
    useCases: ["Debug an expired access token", "Check issuer and audience mismatches", "Inspect custom claims during an authentication integration"],
    notes: ["Decoded claims are untrusted until signature verification succeeds", "Expiration, not-before, issuer and audience checks are separate from cryptographic verification"],
    guideSlugs: ["debug-jwt-tokens-safely"],
  },
  "unix-timestamp-converter": {
    overview: [
      "Unix timestamps represent an instant as seconds or milliseconds from the Unix epoch. XXF detects common numeric lengths and reports ISO 8601, UTC, local time and both epoch units together.",
      "The side-by-side output helps reveal the classic thousand-fold seconds-versus-milliseconds error and separates an absolute instant from the timezone used to display it.",
    ],
    steps: ["Paste Unix seconds, Unix milliseconds or a parseable date string", "Convert and compare ISO, UTC and local representations", "Copy the unit explicitly required by the destination API"],
    useCases: ["Read exp and iat claims from a token", "Debug log times across time zones", "Convert a date into API-ready epoch units"],
    notes: ["A Unix timestamp does not contain a timezone", "Ambiguous human date strings can parse differently, so prefer ISO 8601 with an explicit offset"],
    guideSlugs: [],
  },
  "color-converter": {
    overview: [
      "HEX, RGB and HSL describe the same sRGB color through different coordinate systems. XXF normalizes an accepted input and reports all three forms with a visual preview for quick CSS work.",
      "HSL values are rounded for readability, so repeated conversions can introduce small numerical differences even when the displayed color remains effectively the same.",
    ],
    steps: ["Enter a 3- or 6-digit HEX, rgb() or hsl() color", "Convert and compare the normalized representations", "Copy the format that matches the project's design tokens or stylesheet"],
    useCases: ["Translate a design token between codebases", "Read an RGB value as editable HSL", "Normalize shorthand HEX before documentation"],
    notes: ["This tool intentionally excludes alpha channels", "Contrast and accessibility depend on foreground-background pairs, not one color in isolation"],
    guideSlugs: [],
  },
  "uuid-generator": {
    overview: [
      "UUID version 4 identifiers contain random bits and are useful when independent systems need identifiers without coordinating a central sequence. XXF uses the browser's cryptographic randomUUID implementation and can create up to 100 values at once.",
      "A UUID reduces collision risk but does not prove identity, ownership or authenticity. Treat generated values as identifiers rather than secrets.",
    ],
    steps: ["Enter the number of UUIDs required from 1 to 100", "Generate and review the newline-separated values", "Copy or download them for fixtures, records or local development"],
    useCases: ["Seed database fixtures", "Create client-side identifiers before synchronization", "Prepare example resource IDs for documentation"],
    notes: ["UUIDs are not access tokens and should not be relied on for authorization", "Check whether the destination system expects lowercase, uppercase, braces or another UUID version"],
    guideSlugs: [],
  },
  "sha256-hash": {
    overview: [
      "SHA-256 produces a fixed 256-bit digest from an arbitrary byte sequence. XXF encodes the input as UTF-8, runs the browser Web Crypto implementation and returns a lowercase hexadecimal digest.",
      "A matching hash can confirm that two exact text inputs are identical, but even a trailing newline or different Unicode normalization changes the result completely.",
    ],
    steps: ["Paste the exact text, including intentional whitespace", "Generate the SHA-256 digest", "Compare hashes only when both systems use the same encoding and normalization rules"],
    useCases: ["Verify a text fixture has not changed", "Create a reproducible cache key from public input", "Check a documented SHA-256 example"],
    notes: ["SHA-256 is one-way hashing, not encryption", "Passwords require a slow salted password-hashing algorithm such as Argon2, scrypt or bcrypt"],
    guideSlugs: [],
  },
  "image-compressor": {
    overview: [
      "Image weight affects page speed, data usage and storage. XXF can resize and recompress up to 20 PNG, JPEG or WebP files locally, then compares output sizes so the smart option can keep the smaller result.",
      "Compression quality is visual as well as numerical. Preview important images at their real display size and avoid repeated lossy recompression of the same source.",
    ],
    steps: ["Drop or choose up to 20 supported images", "Select smart, WebP, JPEG or PNG output and adjust quality or dimensions", "Compare savings and previews, then download individual files or one ZIP"],
    useCases: ["Prepare product and article images for the web", "Resize oversized screenshots before sharing", "Create lighter WebP alternatives from JPEG or PNG sources"],
    notes: ["PNG is lossless and may remain larger for photographs", "Browser canvas export can remove metadata such as EXIF orientation, location and camera details"],
    guideSlugs: [],
  },
  "photo-collage-maker": {
    overview: [
      "A good collage depends on hierarchy, crop position, spacing and output size rather than simply placing images in a grid. XXF provides balanced and featured layouts plus a custom grid for up to 16 local photos.",
      "Each image can be repositioned inside its frame, and text, shapes, watermarks, canvas ratio and export quality can be adjusted before rendering the final JPG or PNG.",
    ],
    steps: ["Add up to 16 photos and choose a layout that matches their orientation", "Pan crops, set spacing and background, then add only necessary annotations", "Preview the final ratio and export as JPG or PNG"],
    useCases: ["Create a before-and-after comparison", "Assemble a product contact sheet or moodboard", "Publish a labeled social image without uploading source photos"],
    notes: ["Keep the tab open until the finished file is downloaded", "Very large images are resampled by the browser, so keep original files for future edits"],
    guideSlugs: [],
  },
  "m3u8-player": {
    overview: [
      "An M3U8 playlist describes an HTTP Live Streaming presentation and references media segments or variant playlists. XXF uses native HLS support in Safari and an HLS playback engine backed by Media Source Extensions in compatible browsers.",
      "The supplied stream is fetched by your browser directly from its host. Playback therefore depends on the stream's availability, CORS headers, codecs, encryption method and regional or authentication rules.",
    ],
    steps: ["Paste a public M3U8 playlist URL", "Load the stream and review the reported playback mode", "Use browser media controls while watching network or console errors when diagnosing failures"],
    useCases: ["Test a public HLS master playlist", "Compare Safari native playback with another browser", "Confirm that playlist and segment CORS headers allow web playback"],
    notes: ["The tool does not bypass DRM, authentication or geographic restrictions", "A playlist can load while segments fail because each resource needs compatible access headers"],
    guideSlugs: [],
  },
  "video-to-m3u8": {
    overview: [
      "HLS delivery separates a video into a playlist and short media segments. XXF runs FFmpeg through WebAssembly in a browser worker, producing an M3U8 playlist and MPEG-TS files without uploading the selected source.",
      "The downloaded ZIP is a package to host together on a web server or CDN. It is not automatically published, and production delivery still needs correct MIME types, caching, HTTPS and cross-origin headers.",
    ],
    steps: ["Choose a supported local video and a segment duration", "Start conversion and keep the tab open while the browser processes the file", "Download the ZIP, extract all files together and test the hosted playlist in an HLS player"],
    useCases: ["Prototype HLS delivery from a short MP4", "Create a local test package for player development", "Understand playlist and segment structure before building a server pipeline"],
    notes: ["Large or long videos require substantial memory and are better processed with native FFmpeg", "This single-rendition output is not an adaptive bitrate ladder"],
    guideSlugs: [],
  },
  "css-formatter-minifier": {
    overview: [
      "CSS formatting adds line breaks and indentation for inspection, while minification removes comments and unnecessary whitespace for delivery. XXF offers both directions without sending a stylesheet to a remote service.",
      "The transformation is intentionally conservative and text-based. It does not reorder declarations, merge selectors, rewrite values or attempt aggressive semantic optimization.",
    ],
    steps: ["Choose Format or Minify and paste the stylesheet", "Run the conversion and inspect complex rules, comments and data URLs", "Test the result in the target browser set before replacing a production asset"],
    useCases: ["Read a compact third-party stylesheet during debugging", "Shrink a small standalone CSS snippet", "Normalize a generated style block for code review"],
    notes: ["Keep an unminified source file and source map for maintenance", "Use a parser-based build tool for complex production optimization"],
    guideSlugs: [],
  },
};
