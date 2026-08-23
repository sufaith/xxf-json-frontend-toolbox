export type ToolCategory = "JSON" | "Data" | "Frontend" | "Encoding" | "Image";

export type ToolDefinition = {
  slug: string;
  name: string;
  eyebrow: string;
  category: ToolCategory;
  description: string;
  seoDescription: string;
  keywords: string[];
  inputLabel: string;
  outputLabel: string;
  action: string;
  sample: string;
  fileExtension: string;
  reverseSlug?: string;
  directions?: [string, string];
  usesInput?: boolean;
  faq: Array<{ question: string; answer: string }>;
};

const sharedPrivacy = {
  question: "Does XXF upload or store my data?",
  answer:
    "No. The conversion runs locally in your browser. Your input is not sent to XXF, stored on a server or used for training.",
};

export const tools: ToolDefinition[] = [
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    eyebrow: "Format & inspect",
    category: "JSON",
    description: "Beautify JSON with readable indentation and immediate syntax feedback.",
    seoDescription:
      "Format and beautify JSON online with 2-space or 4-space indentation. Private, fast and entirely browser-based.",
    keywords: ["json formatter", "json beautifier", "pretty print json"],
    inputLabel: "Unformatted JSON",
    outputLabel: "Formatted JSON",
    action: "Format JSON",
    sample: '{"project":"XXF","ready":true,"tools":["format","convert","ship"],"encoded":"\\u003e","meta":{"version":1,"private":true}}',
    fileExtension: "json",
    faq: [
      sharedPrivacy,
      {
        question: "What does the formatter change?",
        answer:
          "It changes whitespace and indentation only. Property names, values, array order and object key order remain unchanged.",
      },
    ],
  },
  {
    slug: "json-validator",
    name: "JSON Validator",
    eyebrow: "Find syntax errors",
    category: "JSON",
    description: "Validate JSON and get a clear summary of its structure and values.",
    seoDescription:
      "Validate JSON syntax online and inspect object, array and primitive counts without uploading your data.",
    keywords: ["json validator", "validate json online", "json syntax checker"],
    inputLabel: "JSON to validate",
    outputLabel: "Validation report",
    action: "Validate JSON",
    sample: '{"status":"valid","items":[1,2,3],"owner":{"name":"Ada"}}',
    fileExtension: "txt",
    faq: [
      sharedPrivacy,
      {
        question: "Can the validator locate a JSON error?",
        answer:
          "Yes. Invalid input returns the browser parser message and XXF estimates the line and column when a character position is available.",
      },
    ],
  },
  {
    slug: "json-minifier",
    name: "JSON Minifier",
    eyebrow: "Shrink payloads",
    category: "JSON",
    description: "Remove unnecessary JSON whitespace while preserving every value.",
    seoDescription:
      "Minify JSON online to reduce payload size. See byte savings instantly and copy or download the compact result.",
    keywords: ["json minifier", "compress json", "minify json online"],
    inputLabel: "Formatted JSON",
    outputLabel: "Minified JSON",
    action: "Minify JSON",
    sample: '{\n  "name": "compact",\n  "enabled": true,\n  "tags": ["api", "frontend"]\n}',
    fileExtension: "json",
    faq: [
      sharedPrivacy,
      {
        question: "Does JSON minification lose information?",
        answer:
          "No. It removes insignificant whitespace only. Parsed values and their types remain the same.",
      },
    ],
  },
  {
    slug: "json-key-sorter",
    name: "JSON Key Sorter",
    eyebrow: "Normalize objects",
    category: "JSON",
    description: "Sort object keys recursively for stable diffs and predictable snapshots.",
    seoDescription:
      "Alphabetically sort JSON object keys at every nesting level for clean diffs, fixtures and deterministic output.",
    keywords: ["sort json keys", "alphabetize json", "normalize json"],
    inputLabel: "JSON object",
    outputLabel: "Sorted JSON",
    action: "Sort keys",
    sample: '{"zebra":1,"alpha":{"z":2,"a":1},"items":[{"last":2,"first":1}]}',
    fileExtension: "json",
    faq: [
      sharedPrivacy,
      {
        question: "Are array items reordered?",
        answer:
          "No. Arrays keep their original order; only keys inside objects are alphabetized recursively.",
      },
    ],
  },
  {
    slug: "json-to-typescript",
    name: "JSON to TypeScript",
    eyebrow: "Generate types",
    category: "JSON",
    description: "Infer practical TypeScript interfaces from a real JSON sample.",
    seoDescription:
      "Convert JSON to TypeScript interfaces online. Infer nested objects, arrays, unions and nullable fields locally.",
    keywords: ["json to typescript", "json to interface", "generate typescript types"],
    inputLabel: "Sample JSON",
    outputLabel: "TypeScript types",
    action: "Generate types",
    sample: '{"id":42,"name":"Nova","active":true,"roles":["admin","editor"],"profile":{"avatar":null,"score":9.4}}',
    fileExtension: "ts",
    faq: [
      sharedPrivacy,
      {
        question: "How are arrays inferred?",
        answer:
          "XXF inspects every sample item and combines distinct shapes into a safe union when necessary.",
      },
    ],
  },
  {
    slug: "json-to-zod",
    name: "JSON to Zod",
    eyebrow: "Create schemas",
    category: "JSON",
    description: "Turn sample JSON into a readable Zod validation schema.",
    seoDescription:
      "Generate a Zod schema from JSON online, including nested objects, arrays, nullable values and primitive types.",
    keywords: ["json to zod", "zod schema generator", "generate zod from json"],
    inputLabel: "Sample JSON",
    outputLabel: "Zod schema",
    action: "Generate Zod",
    sample: '{"email":"hello@example.com","age":28,"preferences":{"darkMode":true},"tags":["dev"]}',
    fileExtension: "ts",
    faq: [
      sharedPrivacy,
      {
        question: "Is the generated schema a replacement for review?",
        answer:
          "It is a strong starting point derived from one sample. Review optional fields and domain-specific constraints before production use.",
      },
    ],
  },
  {
    slug: "json-to-json-schema",
    name: "JSON to JSON Schema",
    eyebrow: "Document payloads",
    category: "JSON",
    description: "Infer a Draft 2020-12 JSON Schema from representative data.",
    seoDescription:
      "Convert JSON examples to JSON Schema Draft 2020-12 with nested properties, required fields and array item types.",
    keywords: ["json to json schema", "json schema generator", "infer json schema"],
    inputLabel: "Sample JSON",
    outputLabel: "JSON Schema",
    action: "Generate schema",
    sample: '{"orderId":"A-104","total":49.9,"paid":false,"items":[{"sku":"P1","qty":2}]}',
    fileExtension: "schema.json",
    faq: [
      sharedPrivacy,
      {
        question: "Which JSON Schema version is generated?",
        answer:
          "The output declares JSON Schema Draft 2020-12 and can be extended with formats, ranges and descriptions.",
      },
    ],
  },
  {
    slug: "json-to-yaml",
    name: "JSON to YAML",
    eyebrow: "Config conversion",
    category: "Data",
    description: "Convert JSON into clean, human-readable YAML configuration.",
    seoDescription:
      "Convert JSON to YAML online with preserved arrays, objects, booleans and null values. Runs entirely in your browser.",
    keywords: ["json to yaml", "convert json yaml", "json yaml converter"],
    inputLabel: "JSON",
    outputLabel: "YAML",
    action: "Convert to YAML",
    sample: '{"service":"web","replicas":3,"ports":[80,443],"environment":{"NODE_ENV":"production"}}',
    fileExtension: "yaml",
    reverseSlug: "yaml-to-json",
    faq: [sharedPrivacy, { question: "Are JSON data types preserved?", answer: "Yes. Objects, arrays, strings, numbers, booleans and null values are represented with matching YAML types." }],
  },
  {
    slug: "yaml-to-json",
    name: "YAML to JSON",
    eyebrow: "Config conversion",
    category: "Data",
    description: "Parse YAML safely and return consistently formatted JSON.",
    seoDescription:
      "Convert YAML to JSON online and catch YAML syntax errors before using configuration in your app or API.",
    keywords: ["yaml to json", "convert yaml json", "yaml parser online"],
    inputLabel: "YAML",
    outputLabel: "JSON",
    action: "Convert to JSON",
    sample: 'service: web\nreplicas: 3\nports:\n  - 80\n  - 443\nenvironment:\n  NODE_ENV: production',
    fileExtension: "json",
    reverseSlug: "json-to-yaml",
    faq: [sharedPrivacy, { question: "Does this support nested YAML?", answer: "Yes. Maps, sequences, nested values, block strings, anchors and common scalar types are parsed by a standards-based YAML parser." }],
  },
  {
    slug: "json-to-csv",
    name: "JSON to CSV",
    eyebrow: "Tabular export",
    category: "Data",
    description: "Flatten JSON records into spreadsheet-ready CSV rows.",
    seoDescription:
      "Convert arrays of JSON objects to CSV online with safe quoting and nested value handling. Download the result instantly.",
    keywords: ["json to csv", "convert json csv", "json array to spreadsheet"],
    inputLabel: "JSON array",
    outputLabel: "CSV",
    action: "Convert to CSV",
    sample: '[{"name":"Ada","role":"Engineer","active":true},{"name":"Lin","role":"Designer","active":false}]',
    fileExtension: "csv",
    reverseSlug: "csv-to-json",
    faq: [sharedPrivacy, { question: "What JSON shape works best?", answer: "Use an array of similarly shaped objects. Nested objects are serialized as compact JSON inside their CSV cells." }],
  },
  {
    slug: "csv-to-json",
    name: "CSV to JSON",
    eyebrow: "Tabular import",
    category: "Data",
    description: "Convert CSV rows into an array of named JSON objects.",
    seoDescription:
      "Convert CSV to JSON online with header detection, quoted-field support and empty-row handling. No spreadsheet upload required.",
    keywords: ["csv to json", "convert csv json", "csv parser online"],
    inputLabel: "CSV",
    outputLabel: "JSON array",
    action: "Convert to JSON",
    sample: 'name,role,active\nAda,Engineer,true\nLin,Designer,false',
    fileExtension: "json",
    reverseSlug: "json-to-csv",
    faq: [sharedPrivacy, { question: "Are quoted commas supported?", answer: "Yes. Standards-compliant quoted values, escaped quotes and multiline fields are handled by the CSV parser." }],
  },
  {
    slug: "json-to-xml",
    name: "JSON to XML",
    eyebrow: "Legacy integration",
    category: "Data",
    description: "Build well-formed XML from nested JSON objects and arrays.",
    seoDescription:
      "Convert JSON to XML online with configurable-safe nested output for APIs, feeds and legacy integrations.",
    keywords: ["json to xml", "convert json xml", "json xml converter"],
    inputLabel: "JSON",
    outputLabel: "XML",
    action: "Convert to XML",
    sample: '{"catalog":{"product":[{"id":1,"name":"Keyboard"},{"id":2,"name":"Mouse"}]}}',
    fileExtension: "xml",
    reverseSlug: "xml-to-json",
    faq: [sharedPrivacy, { question: "How are arrays represented in XML?", answer: "Repeated array values are emitted as repeated elements under their JSON property name." }],
  },
  {
    slug: "xml-to-json",
    name: "XML to JSON",
    eyebrow: "Legacy integration",
    category: "Data",
    description: "Parse XML documents into readable, structured JSON.",
    seoDescription:
      "Convert XML to JSON online with attribute support, nested elements and readable formatting in a private browser workflow.",
    keywords: ["xml to json", "convert xml json", "xml parser online"],
    inputLabel: "XML",
    outputLabel: "JSON",
    action: "Convert to JSON",
    sample: '<catalog><product id="1"><name>Keyboard</name></product><product id="2"><name>Mouse</name></product></catalog>',
    fileExtension: "json",
    reverseSlug: "json-to-xml",
    faq: [sharedPrivacy, { question: "Are XML attributes included?", answer: "Yes. Attributes are preserved with an @ prefix so they remain distinct from child elements." }],
  },
  {
    slug: "json-to-html-table",
    name: "JSON to HTML Table",
    eyebrow: "Frontend markup",
    category: "Frontend",
    description: "Generate semantic HTML table markup from JSON records.",
    seoDescription:
      "Convert JSON arrays to an accessible HTML table with escaped content, table headers and clean frontend-ready markup.",
    keywords: ["json to html table", "generate html table", "json html converter"],
    inputLabel: "JSON records",
    outputLabel: "HTML table",
    action: "Generate HTML",
    sample: '[{"Product":"Starter","Price":"$9","Available":true},{"Product":"Pro","Price":"$29","Available":false}]',
    fileExtension: "html",
    faq: [sharedPrivacy, { question: "Is the generated HTML safe to paste?", answer: "Cell content is HTML-escaped. You should still apply your own styling and content-security practices in the final application." }],
  },
  {
    slug: "json-to-markdown-table",
    name: "JSON to Markdown Table",
    eyebrow: "Docs & READMEs",
    category: "Frontend",
    description: "Turn JSON records into a clean Markdown table for documentation.",
    seoDescription:
      "Convert JSON arrays to Markdown tables for GitHub, documentation, changelogs and technical notes.",
    keywords: ["json to markdown table", "json markdown converter", "markdown table generator"],
    inputLabel: "JSON records",
    outputLabel: "Markdown table",
    action: "Generate Markdown",
    sample: '[{"Feature":"Local processing","Status":"Ready"},{"Feature":"Batch tools","Status":"Ready"}]',
    fileExtension: "md",
    faq: [sharedPrivacy, { question: "How are nested values displayed?", answer: "Objects and arrays are compacted into JSON strings, then pipes and line breaks are escaped for Markdown tables." }],
  },
  {
    slug: "url-encoder-decoder",
    name: "URL Encoder / Decoder",
    eyebrow: "Safe URLs",
    category: "Encoding",
    description: "Encode or decode URL components without damaging Unicode text.",
    seoDescription:
      "Encode and decode URL components online, including Unicode, spaces, query values and reserved characters.",
    keywords: ["url encoder", "url decoder", "percent encoding"],
    inputLabel: "Text or encoded URL component",
    outputLabel: "Converted value",
    action: "Convert URL text",
    sample: 'campaign=summer launch&city=上海',
    fileExtension: "txt",
    directions: ["Encode", "Decode"],
    faq: [sharedPrivacy, { question: "Does this encode an entire URL?", answer: "It uses URL-component encoding, which is ideal for individual path or query values. Keep protocol and hostname separators outside the input." }],
  },
  {
    slug: "base64-encoder-decoder",
    name: "Base64 Encoder / Decoder",
    eyebrow: "Unicode-safe",
    category: "Encoding",
    description: "Encode UTF-8 text to Base64 or decode Base64 back to text.",
    seoDescription:
      "Encode or decode Base64 online with correct UTF-8 and Unicode handling. Your text never leaves the browser.",
    keywords: ["base64 encoder", "base64 decoder", "utf8 base64"],
    inputLabel: "Plain text or Base64",
    outputLabel: "Converted text",
    action: "Convert Base64",
    sample: 'Frontend tools should handle 中文 and emoji 🚀',
    fileExtension: "txt",
    directions: ["Encode", "Decode"],
    faq: [sharedPrivacy, { question: "Does this support Unicode?", answer: "Yes. XXF converts through UTF-8 bytes, so Chinese text, emoji and other Unicode characters round-trip correctly." }],
  },
  {
    slug: "html-entities",
    name: "HTML Entity Encoder / Decoder",
    eyebrow: "Escape markup",
    category: "Encoding",
    description: "Encode unsafe HTML characters or decode entities into readable text.",
    seoDescription:
      "Encode and decode HTML entities online for ampersands, quotes, angle brackets and Unicode numeric entities.",
    keywords: ["html entity encoder", "html entity decoder", "escape html"],
    inputLabel: "HTML or encoded text",
    outputLabel: "Converted text",
    action: "Convert entities",
    sample: '<button aria-label="Save & close">Done</button>',
    fileExtension: "txt",
    directions: ["Encode", "Decode"],
    faq: [sharedPrivacy, { question: "Which characters are encoded?", answer: "The encoder protects ampersands, angle brackets, double quotes and single quotes—the characters most commonly unsafe in HTML text." }],
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    eyebrow: "Inspect tokens",
    category: "Frontend",
    description: "Decode JWT headers and payloads locally without verification or transmission.",
    seoDescription:
      "Decode JWT header and payload data online in your browser. No token upload, storage or network request.",
    keywords: ["jwt decoder", "decode jwt token", "jwt inspector"],
    inputLabel: "JWT token",
    outputLabel: "Decoded JWT",
    action: "Decode token",
    sample: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSIsImlhdCI6MTUxNjIzOTAyMn0.signature',
    fileExtension: "json",
    faq: [sharedPrivacy, { question: "Does decoding verify the JWT signature?", answer: "No. Decoding only displays Base64URL data. Always verify the signature and claims with a trusted server-side library before granting access." }],
  },
  {
    slug: "unix-timestamp-converter",
    name: "Unix Timestamp Converter",
    eyebrow: "Time debugging",
    category: "Frontend",
    description: "Convert Unix seconds or milliseconds into ISO and local dates.",
    seoDescription:
      "Convert Unix timestamps to ISO, UTC and local dates, or turn date strings into seconds and milliseconds.",
    keywords: ["unix timestamp converter", "epoch converter", "timestamp to date"],
    inputLabel: "Timestamp or date",
    outputLabel: "Converted time",
    action: "Convert timestamp",
    sample: "1767225600",
    fileExtension: "txt",
    faq: [sharedPrivacy, { question: "Are seconds and milliseconds both supported?", answer: "Yes. Numeric values are detected by length, and the report includes both Unix seconds and milliseconds." }],
  },
  {
    slug: "color-converter",
    name: "HEX / RGB / HSL Converter",
    eyebrow: "CSS colors",
    category: "Frontend",
    description: "Convert CSS colors between HEX, RGB and HSL representations.",
    seoDescription:
      "Convert HEX, RGB and HSL CSS colors online with normalized values and an instant visual preview.",
    keywords: ["hex to rgb", "rgb to hsl", "css color converter"],
    inputLabel: "HEX, RGB or HSL color",
    outputLabel: "Color values",
    action: "Convert color",
    sample: "#6c5ce7",
    fileExtension: "txt",
    faq: [sharedPrivacy, { question: "Which CSS color formats are accepted?", answer: "Use 3- or 6-digit HEX, rgb(r, g, b), or hsl(h, s%, l%). Alpha channels are intentionally excluded for predictable conversion." }],
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    eyebrow: "Random identifiers",
    category: "Frontend",
    description: "Generate cryptographically strong UUID v4 identifiers in bulk.",
    seoDescription:
      "Generate one or many UUID v4 identifiers online using the browser cryptography API. Copy or download instantly.",
    keywords: ["uuid generator", "guid generator", "uuid v4 online"],
    inputLabel: "How many? (1–100)",
    outputLabel: "UUID v4 values",
    action: "Generate UUIDs",
    sample: "5",
    fileExtension: "txt",
    faq: [sharedPrivacy, { question: "How random are these UUIDs?", answer: "They are generated with the browser crypto.randomUUID API, which uses a cryptographically secure random source." }],
  },
  {
    slug: "sha256-hash",
    name: "SHA-256 Hash Generator",
    eyebrow: "Digest text",
    category: "Frontend",
    description: "Create a lowercase SHA-256 digest from UTF-8 text.",
    seoDescription:
      "Generate SHA-256 hashes from text online with the native Web Crypto API and no server transmission.",
    keywords: ["sha256 generator", "sha 256 hash online", "text hash tool"],
    inputLabel: "Text to hash",
    outputLabel: "SHA-256 digest",
    action: "Generate hash",
    sample: "ship reliable frontend tools",
    fileExtension: "txt",
    faq: [sharedPrivacy, { question: "Can SHA-256 hashes be reversed?", answer: "No. SHA-256 is a one-way digest. It is not encryption, and it should not be used alone for password storage." }],
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    eyebrow: "Shrink image files",
    category: "Image",
    description: "Compress PNG, JPEG and WebP images in batches without uploading them.",
    seoDescription:
      "Compress PNG, JPEG and WebP images online with quality, format and resize controls. Batch download smaller images with no uploads.",
    keywords: ["image compressor", "compress png", "compress jpeg", "compress webp", "reduce image size"],
    inputLabel: "Images",
    outputLabel: "Compressed images",
    action: "Compress images",
    sample: "",
    fileExtension: "zip",
    usesInput: false,
    faq: [
      sharedPrivacy,
      {
        question: "Which image formats are supported?",
        answer: "XXF compresses PNG, JPEG and WebP images and can keep the original type or export WebP, JPEG or PNG.",
      },
      {
        question: "Can I compress several images at once?",
        answer: "Yes. Add up to 20 images, compare their savings and download every finished result together as a ZIP file.",
      },
    ],
  },
  {
    slug: "photo-collage-maker",
    name: "Photo Collage Maker",
    eyebrow: "Compose images",
    category: "Image",
    description: "Arrange up to 16 photos, annotate the canvas and export a polished collage locally.",
    seoDescription:
      "Create photo collages online with flexible layouts, custom grids, image positioning, annotations, watermarks and JPG or PNG export. No uploads.",
    keywords: ["photo collage maker", "online collage maker", "combine photos", "image grid maker"],
    inputLabel: "Photos",
    outputLabel: "Collage preview",
    action: "Create collage",
    sample: "",
    fileExtension: "png",
    usesInput: false,
    faq: [
      sharedPrivacy,
      {
        question: "How many photos can I add?",
        answer: "You can combine up to 16 photos using balanced grids, featured layouts or a custom row-and-column layout.",
      },
      {
        question: "Which image formats can I export?",
        answer: "Export a high-quality JPG, a smaller standard JPG or a lossless PNG. Supported browsers can also copy the rendered image directly to the clipboard.",
      },
    ],
  },
  {
    slug: "css-formatter-minifier",
    name: "CSS Formatter / Minifier",
    eyebrow: "Clean stylesheets",
    category: "Frontend",
    description: "Format compact CSS for reading or minify CSS for delivery.",
    seoDescription:
      "Format or minify CSS online for readable debugging and smaller production stylesheets. Local browser processing only.",
    keywords: ["css formatter", "css minifier", "beautify css online"],
    inputLabel: "CSS",
    outputLabel: "Converted CSS",
    action: "Convert CSS",
    sample: '.card{display:grid;gap:1rem;padding:2rem;background:#fff}.card:hover{transform:translateY(-2px)}',
    fileExtension: "css",
    directions: ["Format", "Minify"],
    faq: [sharedPrivacy, { question: "Will the minifier change how my CSS behaves?", answer: "It removes comments and unnecessary whitespace conservatively. Always test complex generated CSS or data URLs before production deployment." }],
  },
];

export const categories: ToolCategory[] = ["JSON", "Data", "Frontend", "Encoding", "Image"];

export const toolMap = new Map(tools.map((tool) => [tool.slug, tool]));

export function getRelatedTools(tool: ToolDefinition, count = 4) {
  const sameCategory = tools.filter(
    (candidate) => candidate.category === tool.category && candidate.slug !== tool.slug,
  );
  const others = tools.filter(
    (candidate) => candidate.category !== tool.category && candidate.slug !== tool.slug,
  );
  return [...sameCategory, ...others].slice(0, count);
}
