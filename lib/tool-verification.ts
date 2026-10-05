export type ToolVerification = {
  level: "Automated" | "Manual" | "Network";
  method: string;
  invariant: string;
  boundary: string;
};

export const toolVerification: Record<string, ToolVerification> = {
  "url-parser": {
    level: "Manual",
    method: "Load the included URL, inspect the origin, path, fragment and each decoded query value, then expand the nested next URL.",
    invariant: "Parsing must not request or rewrite the supplied address.",
    boundary: "A syntactically valid URL can still be unsafe, expired or unreachable.",
  },
  "redirect-checker": {
    level: "Network",
    method: "Trace a public HTTP(S) address hop by hop with both supplied user-agent profiles and compare status and Location values.",
    invariant: "Every displayed hop must come from an observed HTTP response, not a guessed destination.",
    boundary: "Cookie, authentication, region and JavaScript redirects can differ from this server-side request.",
  },
  "json-formatter": {
    level: "Automated",
    method: "Parse the included compact object and compare the two-space result with the committed expected output.",
    invariant: "Property names, parsed values and array order remain unchanged.",
    boundary: "Source-level details such as duplicate keys and number spelling are not losslessly preserved by JSON.parse.",
  },
  "json-validator": {
    level: "Automated",
    method: "Validate the included nested object, then remove a closing brace and confirm that parsing fails.",
    invariant: "A valid report is produced only after the complete document parses successfully.",
    boundary: "Syntax validity does not prove compliance with an application schema.",
  },
  "json-minifier": {
    level: "Automated",
    method: "Minify the included indented object and compare the exact compact string with the committed fixture.",
    invariant: "Only insignificant JSON whitespace is removed after parsing.",
    boundary: "Minification is not encryption, redaction or HTTP compression.",
  },
  "json-key-sorter": {
    level: "Automated",
    method: "Sort the included nested object and verify object keys recursively while preserving array positions.",
    invariant: "Array item order stays stable while keys inside every object are ordered.",
    boundary: "The result is deterministic for this tool, not a universal canonical JSON standard.",
  },
  "json-to-typescript": {
    level: "Automated",
    method: "Generate declarations from the included profile object and compare the complete output with the tested fixture.",
    invariant: "Every observed nested value is represented by the emitted interfaces and field types.",
    boundary: "One sample cannot reveal absent optional fields or runtime validation rules.",
  },
  "json-to-zod": {
    level: "Automated",
    method: "Generate a schema from the included preferences object and compare it with the expected Zod source.",
    invariant: "Observed objects, arrays, primitives and null values receive explicit schema nodes.",
    boundary: "Formats, ranges, optionality and business constraints require human review.",
  },
  "json-to-json-schema": {
    level: "Automated",
    method: "Infer Draft 2020-12 structure from the included order and verify the nested item schema and required arrays.",
    invariant: "The emitted document declares its draft and represents every observed property.",
    boundary: "The strict required and additionalProperties choices are starting assumptions, not discovered business rules.",
  },
  "json-to-yaml": {
    level: "Automated",
    method: "Convert the included service object and compare mappings, sequence items and scalar values with the fixture.",
    invariant: "The parsed JSON data model survives the conversion.",
    boundary: "JSON contains no YAML comments, anchors or original scalar styles to preserve.",
  },
  "yaml-to-json": {
    level: "Automated",
    method: "Parse the included service YAML and compare the complete indented JSON result with the expected output.",
    invariant: "Mappings, sequences and resolved scalar types are represented in JSON.",
    boundary: "Comments, anchor names and authoring style disappear after parsing.",
  },
  "json-to-csv": {
    level: "Automated",
    method: "Convert the included two-record array and verify headers, row count, quoting and line endings.",
    invariant: "Each source record becomes one row and every selected property becomes a column.",
    boundary: "Nested values remain compact JSON cells rather than being silently flattened.",
  },
  "csv-to-json": {
    level: "Automated",
    method: "Parse the included header and two rows, then compare property names and string cell values with the fixture.",
    invariant: "Quoted delimiters and row boundaries are handled by the CSV parser.",
    boundary: "CSV provides no universal number, date or boolean type metadata.",
  },
  "json-to-xml": {
    level: "Automated",
    method: "Convert the included catalog and verify its document root and repeated product elements.",
    invariant: "Nested objects become elements and array members become repeated elements.",
    boundary: "Namespaces, attributes and schema-specific wrappers cannot be inferred from generic JSON.",
  },
  "xml-to-json": {
    level: "Automated",
    method: "Parse the included catalog and verify repeated products, child text and @-prefixed id attributes.",
    invariant: "Attributes remain distinguishable from child elements in the result.",
    boundary: "Mixed content, namespace meaning and lexical formatting may need a domain model.",
  },
  "json-to-html-table": {
    level: "Automated",
    method: "Render the included records and compare semantic table, header and escaped cell markup with the fixture.",
    invariant: "Untrusted cell text is escaped before it enters generated HTML.",
    boundary: "Generated markup does not add application-specific captions, sorting or accessibility context.",
  },
  "json-to-markdown-table": {
    level: "Automated",
    method: "Convert the included records and verify header, separator, row and escaped pipe output.",
    invariant: "Every record is represented once and table-breaking characters are escaped.",
    boundary: "Markdown table behavior still depends on the destination renderer.",
  },
  "url-encoder-decoder": {
    level: "Automated",
    method: "Encode and decode the documented Unicode component fixture and compare both directions byte for byte.",
    invariant: "A valid round trip restores the original UTF-8 text.",
    boundary: "Encoding a component is different from validating or safely assembling a complete URL.",
  },
  "base64-encoder-decoder": {
    level: "Automated",
    method: "Encode and decode the documented UTF-8 fixture and compare the result with the committed Base64 value.",
    invariant: "Decoding the emitted Base64 restores the same UTF-8 text.",
    boundary: "Base64 is reversible transport encoding and provides no secrecy.",
  },
  "html-entities": {
    level: "Automated",
    method: "Encode and decode the documented markup-like text and compare the expected named entities.",
    invariant: "HTML-significant text characters are represented without executing markup.",
    boundary: "HTML text, attributes, URLs, CSS and JavaScript are different output contexts.",
  },
  "jwt-decoder": {
    level: "Automated",
    method: "Decode the included three-segment token and verify its header, claims and readable timestamps.",
    invariant: "Only the Base64URL header and payload are interpreted; no verification success is claimed.",
    boundary: "Authorization requires signature, issuer, audience, algorithm and time validation with trusted keys.",
  },
  "unix-timestamp-converter": {
    level: "Automated",
    method: "Convert equivalent second and millisecond fixtures and compare invariant ISO, UTC and Unix lines.",
    invariant: "Equivalent second and millisecond inputs identify the same instant and produce the same ISO and UTC values.",
    boundary: "The Local line depends on the visitor's timezone and the unit detector is heuristic.",
  },
  "color-converter": {
    level: "Automated",
    method: "Convert the included CSS color among HEX, RGB and HSL and compare normalized channel values.",
    invariant: "All displayed formats represent the same sRGB color within documented rounding.",
    boundary: "Format conversion does not calculate contrast or account for wide-gamut profiles.",
  },
  "uuid-generator": {
    level: "Automated",
    method: "Generate two batches and validate count, hexadecimal layout, version 4 and RFC variant bits.",
    invariant: "Every generated identifier matches UUID v4 representation rules.",
    boundary: "Random identifiers are not authentication credentials or proof of ownership.",
  },
  "sha256-hash": {
    level: "Automated",
    method: "Hash the exact UTF-8 text abc without a newline and compare the 64-character digest with the published vector.",
    invariant: "The same input bytes produce the same lowercase SHA-256 digest.",
    boundary: "A digest alone does not authenticate its source and is unsuitable for password storage.",
  },
  "image-compressor": {
    level: "Manual",
    method: "Compare a photograph and transparent graphic at fixed dimensions, recording actual MIME type, pixels and downloaded bytes.",
    invariant: "Selected files stay in the browser and each result reports its real dimensions and size.",
    boundary: "Browser encoders, metadata and visual tolerance affect the useful output choice.",
  },
  "photo-collage-maker": {
    level: "Manual",
    method: "Load multiple local images, change layout and crop positions, add an annotation, then inspect the exported PNG or JPEG.",
    invariant: "Canvas composition and export happen locally without an upload request.",
    boundary: "The exported image is flattened and does not preserve editable layers.",
  },
  "m3u8-player": {
    level: "Network",
    method: "Load the public test stream, inspect manifest and segment requests, then verify playback controls and error reporting.",
    invariant: "Playback begins only after a reachable playlist and compatible media dependencies load.",
    boundary: "CORS, DRM, authentication, region restrictions and codecs remain controlled by the stream host and browser.",
  },
  "video-to-m3u8": {
    level: "Manual",
    method: "Convert a short local video, inspect the generated media playlist and segments, download the ZIP and replay it from HTTPS hosting.",
    invariant: "The playlist references every generated segment by a relative path and the package stays together.",
    boundary: "The browser workflow creates one rendition, not a production adaptive-bitrate ladder.",
  },
  "css-formatter-minifier": {
    level: "Automated",
    method: "Format and minify the included stylesheet, including a string containing >, and compare the tested result.",
    invariant: "Comments and removable whitespace change while quoted string content remains intact.",
    boundary: "Conservative text transformation is not a replacement for a parser-based production optimizer.",
  },
};
