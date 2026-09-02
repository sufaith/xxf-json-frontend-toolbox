export type ToolExample = {
  scenario: string;
  observation: string;
};

export const toolExamples: Record<string, ToolExample> = {
  "url-parser": {
    scenario: "Inspect the included XXF URL with mode, theme and an encoded next parameter",
    observation: "The parser separates the xxf.app origin and formatter path, then exposes three query values. Expanding next reveals the nested example.com URL and its ref parameter without altering the original address",
  },
  "redirect-checker": {
    scenario: "Check the canonical https://xxf.app/ address with the desktop user agent",
    observation: "A healthy canonical address should finish on the same HTTPS URL without an avoidable hostname or protocol hop. Repeat with a legacy HTTP or www address to compare the chain",
  },
  "json-formatter": {
    scenario: "Format the included compact project object with two-space indentation",
    observation: "The nested meta object and tools array become scannable while values and array order stay unchanged. Toggle escape display to compare the encoded greater-than sequence with its readable character",
  },
  "json-validator": {
    scenario: "Validate the included object containing an items array and owner object",
    observation: "The report identifies a valid object root and counts the nested containers and primitive values. Removing one closing brace demonstrates how the first syntax error is reported",
  },
  "json-minifier": {
    scenario: "Minify the included indented object",
    observation: "Line breaks and indentation disappear, but the string, boolean and two array values remain identical. The byte comparison isolates savings caused only by insignificant whitespace",
  },
  "json-key-sorter": {
    scenario: "Sort the included object containing zebra, alpha and an array of objects",
    observation: "alpha moves before zebra and nested object keys are sorted recursively. The array item stays in the same position while its own first and last keys are normalized",
  },
  "json-to-typescript": {
    scenario: "Generate declarations from the included user profile sample",
    observation: "The result separates the nested profile shape, keeps roles as a string array and records avatar as null because the single sample provides no evidence of another value type",
  },
  "json-to-zod": {
    scenario: "Generate a schema from the included account-preferences object",
    observation: "The output creates nested z.object calls with string, integer, boolean and string-array validators. Email format, age limits and optional fields still need deliberate domain rules",
  },
  "json-to-json-schema": {
    scenario: "Infer a schema from the included order and line-item sample",
    observation: "The result declares Draft 2020-12, describes the nested item array and marks every observed property as required. Review that strictness before treating the sample as a contract",
  },
  "json-to-yaml": {
    scenario: "Convert the included service configuration to YAML",
    observation: "The object becomes an indented mapping, ports become a sequence and replicas remains numeric. No comments appear because the JSON source contains no comment information",
  },
  "yaml-to-json": {
    scenario: "Convert the included service YAML to JSON",
    observation: "The mapping, port sequence and numeric replica count become explicit JSON values. Original YAML indentation and scalar styling are intentionally not represented in the output",
  },
  "json-to-csv": {
    scenario: "Convert the included two-person record array",
    observation: "name, role and active become headers with one row per object. Boolean values are serialized into cells because CSV does not carry a universal type schema",
  },
  "csv-to-json": {
    scenario: "Convert the included CSV with a header and two data rows",
    observation: "Each row becomes an object keyed by the header names. The active cells remain strings until an application-specific schema converts them to booleans",
  },
  "json-to-xml": {
    scenario: "Convert the included catalog containing two products",
    observation: "The catalog becomes the document root and the product array becomes repeated product elements. A receiving API may still require namespaces or an attribute convention",
  },
  "xml-to-json": {
    scenario: "Convert the included catalog with id attributes",
    observation: "Repeated product elements become an array and each id attribute is preserved with the @ prefix, keeping it distinct from the child name element",
  },
  "json-to-html-table": {
    scenario: "Generate a table from the included product records",
    observation: "The result contains semantic thead and tbody groups with scoped column headers. Cell text is escaped, while caption text and responsive styling remain decisions for the destination page",
  },
  "json-to-markdown-table": {
    scenario: "Generate Markdown from the included feature-status records",
    observation: "Object keys become the header row and each record becomes one table row. Preview the output in the target renderer before publishing because Markdown table support varies",
  },
  "url-encoder-decoder": {
    scenario: "Encode the included campaign value containing spaces, an ampersand and Chinese text",
    observation: "Reserved separators and UTF-8 bytes become percent sequences suitable for one query value. The result is a component, not a complete encoded URL",
  },
  "base64-encoder-decoder": {
    scenario: "Encode and then decode the included multilingual sentence",
    observation: "The Chinese characters and emoji survive the UTF-8 round trip. The Base64 form is longer and fully reversible, so it provides transport compatibility rather than secrecy",
  },
  "html-entities": {
    scenario: "Encode the included button markup as displayable text",
    observation: "Angle brackets, the ampersand and quotes become entities instead of active markup. This text-node encoding does not replace contextual sanitization for arbitrary HTML",
  },
  "jwt-decoder": {
    scenario: "Decode the included three-part demonstration token",
    observation: "The header reports HS256 and the payload exposes sub, name and iat claims. The placeholder signature is displayed but not verified, so none of the claims should authorize access",
  },
  "unix-timestamp-converter": {
    scenario: "Convert the included ten-digit Unix value 1767225600",
    observation: "The ISO and UTC views identify 2026-01-01 00:00:00 UTC, while the local view depends on the browser timezone. The report also shows the corresponding millisecond value",
  },
  "color-converter": {
    scenario: "Convert the included #6c5ce7 color",
    observation: "The normalized result is rgb(108, 92, 231) and approximately hsl(247, 75%, 63%). The preview checks appearance, but contrast still requires a foreground-background pair",
  },
  "uuid-generator": {
    scenario: "Generate five UUIDv4 identifiers from the included count",
    observation: "The output contains five different lowercase identifiers in the 8-4-4-4-12 layout with version 4 bits. Running it again should produce a different set",
  },
  "sha256-hash": {
    scenario: "Hash the included lowercase sentence without adding a final newline",
    observation: "The tool returns one deterministic 64-character lowercase hexadecimal digest. Adding a space or newline creates a completely different result because the input bytes changed",
  },
  "image-compressor": {
    scenario: "Add one representative photograph and one interface screenshot, then keep Smart output selected",
    observation: "The photograph often benefits from lossy WebP or JPEG, while a sharp screenshot may remain smaller as its original PNG. Compare the previews at their real display sizes before downloading",
  },
  "photo-collage-maker": {
    scenario: "Add three landscape photos, choose a featured layout and export the final canvas as PNG",
    observation: "The focal frame receives more space while secondary crops can be repositioned independently. The exported file reflects the selected ratio, spacing, background and annotations",
  },
  "m3u8-player": {
    scenario: "Load a public test master playlist that permits cross-origin browser access",
    observation: "Safari may report native HLS while other compatible browsers use the HLS engine. A playlist can load successfully even when a later segment, codec or key prevents playback",
  },
  "video-to-m3u8": {
    scenario: "Convert a short local MP4 with a six-second segment duration",
    observation: "The ZIP contains one M3U8 media playlist and a sequence of MPEG-TS segments with relative references. Keep every extracted file together when hosting the package",
  },
  "css-formatter-minifier": {
    scenario: "Format the included compact card rules, then switch direction and minify the formatted result",
    observation: "Formatting separates the base and hover blocks for inspection, while minification removes optional whitespace. Selector order and declaration values remain unchanged",
  },
};
