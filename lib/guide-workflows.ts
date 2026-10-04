export type GuideCodeBlock = { label: string; code: string };
export type GuideSection = { heading: string; paragraphs: string[]; bullets?: string[]; codeBlocks?: GuideCodeBlock[] };

// Synthetic examples document observable behavior, rather than measured benchmarks.
export const guideWorkflows: Record<string, GuideSection[]> = {
  "how-to-format-and-validate-json": [
    {
      heading: "Try a valid fixture, then introduce one error",
      paragraphs: [
        "Paste this compact fixture into JSON Formatter and keep two-space indentation. The result below makes the two records visible. Copy the same source into JSON Validator: the root is an object containing an array, not a flat table. Both tools parse the entire document before producing a result.",
        "Now add a comma after the second record, before the closing square bracket. Validation must fail. Remove that comma rather than trying to repair the formatted output; there is no valid output until the source parses. Error wording varies between browser engines, so compare the location and offending punctuation rather than expecting an identical sentence.",
      ],
      codeBlocks: [
        { label: "Input · JSON Formatter", code: '{"items":[{"id":1,"active":true},{"id":2,"active":false}]}' },
        { label: "Expected output · two spaces", code: '{\n  "items": [\n    {\n      "id": 1,\n      "active": true\n    },\n    {\n      "id": 2,\n      "active": false\n    }\n  ]\n}' },
        { label: "Invalid variant · trailing comma", code: '{"items":[{"id":1,"active":true},{"id":2,"active":false},]}' },
      ],
    },
    {
      heading: "Check what parsing can change",
      paragraphs: [
        "XXF uses JavaScript JSON.parse and JSON.stringify. These preserve ordinary parsed values, but they are not a byte-preserving editor: escape spelling and number notation may change, and duplicate property names cannot survive as separate entries in a JavaScript object. Large integer literals beyond JavaScript's safe integer range can lose precision before formatting even starts.",
        "Keep identifiers such as long account numbers as strings when the contract permits it. If exact numeric spelling, duplicate keys or signed request bytes matter, use an appropriate lossless parser or inspect the original bytes. Do not hash or sign the formatted copy and expect the original document's digest to match.",
      ],
      bullets: ["Compare record counts and nesting before copying", "Use strings for identifiers that are not arithmetic values", "Keep the original source when exact bytes matter", "Formatting is not JSON Schema validation"],
    },
  ],
  "json-to-typescript-workflow": [
    {
      heading: "Read a generated type alongside its evidence",
      paragraphs: [
        "Run this fixture through JSON to TypeScript. The generated Root interface describes only the values actually present. The null avatar produces the type null, while an empty roles array produces unknown[]. Neither value tells the generator what future responses may contain.",
        "If the API contract allows avatar to hold a URL and roles to contain strings, the reviewed interface should say string | null and string[]. A property that is sometimes missing needs a question mark; a property that is always present but may be null needs a nullable union. Those are different contracts and cannot be inferred from this one response.",
      ],
      codeBlocks: [
        { label: "Input · JSON to TypeScript", code: '{"id":42,"avatar":null,"roles":[]}' },
        { label: "Expected generated output", code: 'export interface Root {\n  id: number;\n  avatar: null;\n  roles: unknown[];\n}' },
        { label: "Manual revision · only if confirmed by your API", code: 'export interface User {\n  id: number;\n  avatar: string | null;\n  roles: string[];\n  displayName?: string;\n}' },
      ],
    },
    {
      heading: "Treat inference as a draft, not a contract merger",
      paragraphs: [
        "XXF walks nested objects and names interfaces from property keys. Mixed object arrays can expose repeated interface names; review and rename those declarations before compilation. The tool does not infer discriminated unions, API version guarantees or all optional fields from a production dataset. A successful conversion is not a successful TypeScript build.",
        "For untrusted responses, start with unknown at the boundary and validate against an explicit runtime schema. Test a missing field, an unexpected null and the wrong primitive type. Confirm the schema rejects those cases before letting a cast give the editor confidence that runtime data has not earned.",
      ],
      bullets: ["Compile the generated declarations in the consuming project", "Confirm optional and nullable fields with the API owner", "Give repeated nested shapes distinct names", "Add runtime validation before reading external data"],
    },
  ],
  "json-vs-yaml-for-configuration": [
    {
      heading: "Preserve a code and a number as different types",
      paragraphs: [
        "Use YAML to JSON with this fixture. The quoted postal code stays a string, replicas becomes a number and enabled becomes a boolean. The quotation marks are a data decision: removing them invites the YAML parser to interpret a value that may need to retain leading zeroes.",
        "Convert the JSON result back with JSON to YAML, then parse that YAML again. Compare parsed values rather than exact indentation or quote style. XXF uses js-yaml for these conversions, so behavior should be checked against that parser and its version instead of assuming every YAML implementation resolves scalars identically.",
      ],
      codeBlocks: [
        { label: "Input · YAML to JSON", code: 'postalCode: "00123"\nreplicas: 3\nenabled: true' },
        { label: "Expected JSON output", code: '{\n  "postalCode": "00123",\n  "replicas": 3,\n  "enabled": true\n}' },
      ],
    },
    {
      heading: "Expect comments and authoring choices to disappear",
      paragraphs: [
        "A YAML comment explains the author's intent but is not part of the JSON value model. Anchors, aliases, block-scalar style and preferred quoting also do not have direct JSON equivalents. Converting through a JavaScript value can resolve those structures rather than preserve their original spelling.",
        "Keep the human-maintained YAML source when comments matter. Generate JSON as a separate artifact and validate it against the consuming service's schema. A parser accepts syntax; it does not confirm that a replicas field is within the application's allowed range or that a referenced environment variable exists.",
      ],
      bullets: ["Quote identifiers and ambiguous text deliberately", "Keep comments in the authored YAML file", "Compare parsed values after a round trip", "Validate deployment rules separately from syntax"],
    },
  ],
  "convert-json-and-csv-safely": [
    {
      heading: "A quoted comma must stay in one cell",
      paragraphs: [
        "Paste this input into CSV to JSON. The comma inside the quoted name belongs to one field. The doubled quotes around review become ordinary quote characters, and the leading-zero id stays a string. This is why splitting the text on commas is not a CSV parser.",
        "XXF uses the first row as headers, skips empty rows and leaves cells as strings. The string false does not become the boolean false; Boolean(\"false\") would actually return true in JavaScript. Convert values only after checking them against a deliberate import schema.",
      ],
      codeBlocks: [
        { label: "Input · CSV to JSON", code: 'id,name,note\n001,"Ada, Lin","Needs ""review"""' },
        { label: "Expected output", code: JSON.stringify([{ id: "001", name: "Ada, Lin", note: 'Needs "review"' }], null, 2) },
      ],
    },
    {
      heading: "Establish columns before exporting mixed records",
      paragraphs: [
        "For JSON to CSV, supply an array of objects with the same explicit columns. XXF serializes nested objects into cell text rather than expanding dotted paths, and null values become empty cells. CSV therefore cannot distinguish null from an empty string without an additional convention.",
        "The current exporter derives columns from the first record. A key introduced only in a later record can be omitted, so normalize the records before exporting. For example, give every row id, name and note, including empty values, and compare the downloaded header and row count with the intended dataset.",
        "CSV quoting is separate from spreadsheet formula handling. Untrusted cells beginning with formula markers may be evaluated by spreadsheet software. Review the destination's import settings and neutralization policy; a syntactically valid CSV file is not proof that opening it is safe.",
      ],
      bullets: ["Use consistent keys in every JSON record", "Define how null and empty cells are represented", "Keep identifiers as strings", "Check formula-like cells before spreadsheet distribution"],
    },
  ],
  "frontend-encoding-cheat-sheet": [
    {
      heading: "Choose the output for its destination",
      paragraphs: [
        "Use URL Encoder / Decoder in its default encode direction with the text below. The ampersand becomes part of the value rather than a new query separator. Build the rest of the URL with the URL API, or paste the encoded value only where one component is expected. Encoding a whole address with encodeURIComponent would also encode its structural separators.",
        "Compare the Base64 fixture and the HTML text fixture. They have different destinations and cannot be substituted for one another. Base64 output is still readable to anyone who decodes it, while HTML entities must be interpreted in an HTML text context to display the original characters.",
      ],
      codeBlocks: [
        { label: "URL component · input → encoded output", code: 'a & b\na%20%26%20b' },
        { label: "Base64 · UTF-8 input → output", code: 'hello\naGVsbG8=' },
        { label: "HTML text · input → encoded output", code: '<b>A&B</b>\n&lt;b&gt;A&amp;B&lt;/b&gt;' },
      ],
    },
    {
      heading: "Decode only the layer you expect",
      paragraphs: [
        "A URL parameter containing %252F decodes once to %2F, not directly to a slash. Repeated decoding can turn data into path separators, so record whether the upstream system already decoded the parameter. URLSearchParams follows form-style query rules, including treating plus as space; XXF's decodeURIComponent-based tool does not use that same plus rule.",
        "Use textContent or a framework's ordinary text rendering when showing untrusted strings. Encoding angle brackets does not make an arbitrary href safe, and it does not sanitize HTML that a page later inserts with innerHTML. Check the destination protocol, context and trust boundary separately.",
      ],
      bullets: ["Encode one URL component at a time", "Document the number of decoding layers", "Treat Base64 as a representation, not a secret", "Prefer text rendering over manual HTML concatenation"],
    },
  ],
  "debug-jwt-tokens-safely": [
    {
      heading: "Inspect a token whose signature is deliberately invalid",
      paragraphs: [
        "This synthetic token is intentionally unsigned in any meaningful sense: its final segment is the word signature. JWT Decoder can still expose the header and payload. Successful decoding demonstrates that the segments contain readable data; it does not demonstrate a valid signature or an authenticated user.",
        "Change the sub claim in a locally constructed payload and the decoder will show the changed value as well. Authorization must come from a verifier that checks the permitted algorithm, signature, issuer, audience and time constraints against an application's trusted configuration. Never accept the token's own algorithm label as the entire verification policy.",
      ],
      codeBlocks: [
        { label: "Input · synthetic JWT", code: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSIsImlhdCI6MTUxNjIzOTAyMn0.signature' },
        { label: "Expected decoded output · not verified", code: '{\n  "header": {\n    "alg": "HS256",\n    "typ": "JWT"\n  },\n  "payload": {\n    "sub": "1234567890",\n    "name": "Ada",\n    "iat": 1516239022\n  },\n  "signature": "signature"\n}' },
      ],
    },
    {
      heading: "Separate inspection from authentication",
      paragraphs: [
        "XXF's decoder parses the first two segments and displays the third; it does not validate the token structure for use as a credential or fetch verification keys. It is useful for debugging serialization and claims, not for deciding whether a request should be granted access.",
        "Use a synthetic token when reporting a bug. Even though decoding runs in the tab, a real bearer token can be exposed through a screenshot, clipboard history, browser extension or public issue. Revoke an accidentally shared token through the issuing system rather than assuming that hiding its decoded view invalidates it.",
      ],
      bullets: ["Keep real bearer tokens out of bug reports", "Treat every displayed claim as untrusted", "Verify signatures in the consuming application", "Check issuer, audience and time constraints after verification"],
    },
  ],
  "map-json-and-xml-without-losing-meaning": [
    {
      heading: "Check an attribute and repeated elements",
      paragraphs: [
        "Run this compact document through XML to JSON. XXF preserves the id attribute under @id and combines repeated product elements into an array. The parser also interprets numeric element text as numbers. If the receiving system needs a lexical value such as 19.90 rather than a numeric value, that distinction needs an explicit mapping policy.",
        "Converting the JSON back does not automatically recreate the original document. The JSON to XML builder uses its own attribute convention, so an @id key from the parser is not a guaranteed inverse mapping. Review the actual output rather than assuming that similarly named conversion buttons are lossless inverses.",
      ],
      codeBlocks: [
        { label: "Input · XML to JSON", code: '<catalog><product id="p1"><name>Keyboard</name></product><product id="p2"><name>Mouse</name></product></catalog>' },
        { label: "Expected output", code: '{\n  "catalog": {\n    "product": [\n      {\n        "name": "Keyboard",\n        "@id": "p1"\n      },\n      {\n        "name": "Mouse",\n        "@id": "p2"\n      }\n    ]\n  }\n}' },
      ],
    },
    {
      heading: "Do not infer a schema from one occurrence",
      paragraphs: [
        "A single product element can become an object, while repeated products become an array. Normalize that boundary according to the API contract before reading product[0]. Namespaces, mixed text and child content, comments and ordering have additional XML semantics that a plain JSON object may not represent.",
        "For an integration, prepare fixtures with zero, one and several records and compare the schema-required result in each case. Use an XML validator or the receiving service for well-formedness and schema checks: this conversion page does not claim to validate an XSD or preserve every XML document feature.",
      ],
      bullets: ["Define an explicit attribute naming convention", "Normalize singular and repeated elements", "Check lexical numbers and whitespace requirements", "Validate the destination contract separately"],
    },
  ],
  "diagnose-http-redirect-chains": [
    {
      heading: "Write down the chain you intended to deploy",
      paragraphs: [
        "This is a proposed deployment contract for a hypothetical documentation site, not a measured XXF response. Checking an old HTTP address should expose the status and Location at each hop. The final 200 response is useful, but it does not tell you whether there were avoidable hops, a loop or an incorrect intermediate host.",
        "XXF follows redirects manually from its server endpoint and can compare common browser user-agent strings. That is a diagnostic HTTP request, not a full browser navigation: it does not execute client-side redirects or reproduce every cookie, region and authentication state that a visitor brings.",
      ],
      codeBlocks: [
        { label: "Example target chain · verify against your deployment", code: 'http://www.example.com/docs\n  301 Location: https://example.com/docs/\nhttps://example.com/docs/\n  200 OK' },
      ],
    },
    {
      heading: "Reproduce the first response without following it",
      paragraphs: [
        "Request headers separately before following the chain. If HEAD and GET behave differently, repeat with the same method the failing client uses; a HEAD-only success is not enough. Preserve an intentional query string and confirm that each Location resolves to the expected destination.",
        "For POST requests, 307 and 308 preserve the method, while 303 directs the client to retrieve a different resource. Choosing a permanent status also has caching implications. The checker cannot approve a redirect policy for your application; use it to observe the response and then test the affected workflow with the actual client.",
      ],
      codeBlocks: [{ label: "Local diagnostic command · inspect headers for a GET", code: 'curl --silent --show-error --dump-header - --output /dev/null https://example.com/docs/' }],
      bullets: ["Inspect the first status and Location", "Compare GET with the affected request method", "Check query preservation and the canonical host", "Retest user-agent differences in a real browser"],
    },
  ],
  "unix-timestamps-without-timezone-bugs": [
    {
      heading: "Test one instant in both supported units",
      paragraphs: [
        "Enter 1767225600 into Unix Timestamp Converter, then repeat with 1767225600000. Both should identify midnight UTC on January 1, 2026. The Local line depends on the browser's timezone; a Shanghai browser displays 08:00 for the same instant, while a UTC browser displays 00:00.",
        "The number itself has no display timezone. Store an instant and a named timezone separately when a scheduling workflow needs both. Do not add eight hours to the stored Unix value merely to make its UTC rendering look like Shanghai time; that changes the instant rather than its presentation.",
      ],
      codeBlocks: [
        { label: "Equivalent inputs · seconds and milliseconds", code: '1767225600\n1767225600000' },
        { label: "Expected invariant lines · local display omitted", code: 'ISO 8601: 2026-01-01T00:00:00.000Z\nUTC: Thu, 01 Jan 2026 00:00:00 GMT\nUnix seconds: 1767225600\nUnix milliseconds: 1767225600000' },
      ],
    },
    {
      heading: "Know the converter's unit heuristic",
      paragraphs: [
        "XXF treats numeric magnitudes below 100,000,000,000 as seconds and larger magnitudes as milliseconds. This is convenient for contemporary dates, but not a universal unit detector. Historical millisecond values near the epoch and extreme second values can be interpreted in the wrong unit.",
        "When correctness depends on an explicit unit, normalize in the application before converting, or use an ISO string with an offset. Test invalid dates and range boundaries as well as today's examples. A date-only birthday should remain a calendar date; turning it into an instant can move the displayed day in another timezone.",
      ],
      bullets: ["Name fields with _seconds or _milliseconds", "Use an explicit offset for exchanged date strings", "Compare the invariant UTC lines", "Treat local display and calendar dates as separate concerns"],
    },
  ],
  "sha256-hashes-and-random-uuids": [
    {
      heading: "Reproduce a digest with a known three-byte input",
      paragraphs: [
        "Enter exactly abc, with no newline, into SHA-256 Hash Generator. The digest below is deterministic. Add a newline and the input becomes four bytes, producing a different digest. This is a useful way to diagnose disagreement between an editor, a command-line pipeline and a browser tool.",
        "Generate two batches in UUID Generator instead. The identifiers should change between runs; their version digit is 4 and their variant digit is 8, 9, a or b. Do not compare a random batch to a fixed expected list. The layout check confirms representation, not permission or ownership.",
      ],
      codeBlocks: [
        { label: "Input · SHA-256", code: 'abc' },
        { label: "Expected lowercase hexadecimal digest", code: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad' },
        { label: "Cross-check locally · no final newline", code: "printf %s abc | shasum -a 256" },
      ],
    },
    {
      heading: "Choose preprocessing before comparing results",
      paragraphs: [
        "The hash tool encodes the entered text as UTF-8 without stripping whitespace or normalizing Unicode. Visually similar text can therefore have different bytes. Establish whether the protocol preserves line endings, trims final newlines or normalizes text before either side calculates a digest.",
        "A digest is useful for integrity comparison only when the expected value comes from a trusted source. An attacker who can replace both a file and its published hash can make them agree. For passwords, use a dedicated salted password-hashing scheme; for authorization, check authenticated permissions rather than treating an unpredictable UUID as access control.",
      ],
      bullets: ["Keep exact input bytes reproducible", "Specify any text normalization", "Obtain comparison digests from a trusted channel", "Use UUIDs as identifiers, not access grants"],
    },
  ],
  "prepare-images-for-the-web": [
    {
      heading: "Use a repeatable image comparison worksheet",
      paragraphs: [
        "For a 600 CSS-pixel-wide card at 2× display density, start with a maximum dimension of 1200 pixels when the width is the image's longest edge. In Image Compressor, compare one photograph and one screenshot using the same target dimensions. Record source dimensions, output dimensions, actual MIME type and downloaded byte size rather than assuming a fixed percentage saving.",
        "Smart mode chooses the smallest candidate and may keep the original when it is eligible and smaller. Inspect the actual result because the selected output can differ from the format you expected. Use an explicit format when a destination requires WebP or JPEG regardless of size.",
      ],
      codeBlocks: [{ label: "Comparison worksheet · fill with your actual results", code: 'Source: [filename, width × height, bytes]\nTarget: 600 CSS px at 2× density\nMaximum dimension: 1200 px (if width is longest)\nOutput: [MIME type, width × height, bytes]\nVisual check: [text edges, gradients, transparency]\nDecision: [keep original / use result / adjust settings]' }],
    },
    {
      heading: "PNG format does not promise lossless pixels in this tool",
      paragraphs: [
        "PNG is a lossless encoding format, but XXF's PNG compression path quantizes RGB channels when the quality setting is below 99 percent. The encoder can store those altered pixels losslessly while the overall workflow has still changed the source. Choose full quality and unchanged dimensions when exact pixels matter, and compare the result with the original.",
        "JPEG cannot preserve transparency. Check transparent artwork on the intended background before delivery, and keep the original if metadata, color management or archival fidelity matters. Browser encoders and source content affect byte size, so this guide does not claim measured savings or identical outputs across browsers.",
        "For a collage, export only after confirming the final ratio, crop positions and annotations. The exported canvas is a composed image; it does not preserve editable layers or the original files as a project archive.",
      ],
      bullets: ["Record dimensions and actual bytes", "Inspect the result at its display size", "Check transparency before choosing JPEG", "Retain source files for archival or pixel-exact work"],
    },
  ],
  "understand-m3u8-hls-playback": [
    {
      heading: "Recognize a minimal media playlist",
      paragraphs: [
        "This teaching fixture describes two six-second MPEG-TS segments and marks the presentation complete. It is a media playlist, not an adaptive master playlist. It will play only if real, compatible segment files are served at the listed paths; the text below is not a bundled video or a claim of measured playback.",
        "A segment path is relative to the playlist location. If playlist.m3u8 lives at /video/demo/, segment-000.ts must resolve under that directory unless the playlist provides a different path. Copying only the playlist without its segments produces a valid-looking text file with unavailable media dependencies.",
      ],
      codeBlocks: [{ label: "Teaching fixture · pair with real matching segments", code: '#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:6\n#EXT-X-MEDIA-SEQUENCE:0\n#EXTINF:6.000,\nsegment-000.ts\n#EXTINF:6.000,\nsegment-001.ts\n#EXT-X-ENDLIST' }],
    },
    {
      heading: "Follow the first failed dependency",
      paragraphs: [
        "Use the browser's Network panel to inspect the playlist, then the first failed segment or key request. Check response status, the resolved URL and cross-origin headers on that dependency. A successful playlist response does not prove that the later media requests or encoded codecs are usable.",
        "Video to M3U8 creates a ZIP containing a single media playlist and segments. It does not create a multi-bitrate ladder. Extract the package together, serve it over HTTPS and test the same origin and cross-origin paths visitors will use. Use only media you own or are authorized to distribute; the player does not grant rights to a third-party stream.",
      ],
      bullets: ["Keep the playlist and segment paths together", "Inspect CORS on every requested dependency", "Check the actual audio and video codecs", "Use a native encoding pipeline for production ladders"],
    },
  ],
  "format-and-minify-css-safely": [
    {
      heading: "Start with a simple declaration block",
      paragraphs: [
        "Use CSS Formatter / Minifier in the minify direction with this simple rule. The output removes optional spaces and the final semicolon without merging selectors or rewriting values. Compare it in the actual component before replacing a served stylesheet.",
        "This fixture deliberately contains no strings, data URLs or calc expressions. XXF's current implementation uses regular-expression transformations, not a full CSS parser. It is suitable for inspecting simple snippets, but must not be treated as a semantics-preserving production optimizer for arbitrary stylesheets.",
      ],
      codeBlocks: [
        { label: "Input · select minify", code: '.card { display: grid; gap: 1rem; }' },
        { label: "Expected output", code: '.card{display:grid;gap:1rem}' },
        { label: "Counterexample · do not minify with this regex tool", code: '.label::before { content: "a > b"; }' },
      ],
    },
    {
      heading: "Check tokens whose whitespace is data",
      paragraphs: [
        "In the counterexample, a greater-than character is inside a quoted string. The current minifier can remove the surrounding spaces and change the displayed text to a>b. Strings, custom properties and embedded data can contain punctuation that looks like stylesheet structure to a regular expression.",
        "Keep the authored CSS, use a parser-based build tool for production optimization and test computed styles and rendered states. Reversible formatting is still worth checking: adding line breaks inside a string can alter or invalidate its value. A smaller file is useful only when the browser interprets it as intended.",
      ],
      bullets: ["Use this tool for simple snippets", "Preserve the source before transformation", "Check quoted text, data URLs and custom properties", "Use a CSS parser and browser checks for production builds"],
    },
  ],
};
