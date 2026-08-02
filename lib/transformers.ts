import { XMLBuilder, XMLParser } from "fast-xml-parser";
import * as yaml from "js-yaml";
import Papa from "papaparse";

export type TransformOptions = {
  direction?: number;
  indent?: number;
};

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

function parseJson(input: string): JsonValue {
  try {
    return JSON.parse(input) as JsonValue;
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    if (/line\s+\d+\s+column\s+\d+/i.test(error.message)) {
      throw new Error(error.message);
    }
    const position = error.message.match(/position\s+(\d+)/i)?.[1];
    if (!position) throw new Error(error.message);
    const offset = Number(position);
    const before = input.slice(0, offset);
    const line = before.split("\n").length;
    const column = offset - before.lastIndexOf("\n");
    throw new Error(`${error.message} (line ${line}, column ${column})`);
  }
}

function titleCase(value: string) {
  const result = value
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, character: string) => character.toUpperCase())
    .replace(/^[a-z]/, (character) => character.toUpperCase())
    .replace(/^[0-9]/, (character) => `_${character}`);
  return result || "Value";
}

function propertyName(key: string) {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

function jsonType(value: JsonValue, name: string, interfaces: string[]): string {
  if (value === null) return "null";
  if (Array.isArray(value)) {
    if (!value.length) return "unknown[]";
    const itemTypes = unique(value.map((item) => jsonType(item, `${name}Item`, interfaces)));
    const union = itemTypes.length > 1 ? `(${itemTypes.join(" | ")})` : itemTypes[0];
    return `${union}[]`;
  }
  if (typeof value === "object") {
    const interfaceName = titleCase(name);
    const fields = Object.entries(value).map(
      ([key, child]) => `  ${propertyName(key)}: ${jsonType(child, key, interfaces)};`,
    );
    const declaration = `export interface ${interfaceName} {\n${fields.join("\n")}\n}`;
    if (!interfaces.includes(declaration)) interfaces.unshift(declaration);
    return interfaceName;
  }
  return typeof value;
}

function jsonToTypeScript(value: JsonValue) {
  const interfaces: string[] = [];
  const rootType = jsonType(value, "Root", interfaces);
  if (rootType !== "Root") {
    interfaces.push(`\nexport type Root = ${rootType};`);
  }
  return interfaces.join("\n\n");
}

function zodType(value: JsonValue): string {
  if (value === null) return "z.null()";
  if (Array.isArray(value)) {
    if (!value.length) return "z.array(z.unknown())";
    const schemas = unique(value.map(zodType));
    const itemSchema = schemas.length === 1 ? schemas[0] : `z.union([${schemas.join(", ")}])`;
    return `z.array(${itemSchema})`;
  }
  if (typeof value === "object") {
    const fields = Object.entries(value).map(
      ([key, child]) => `  ${JSON.stringify(key)}: ${zodType(child)},`,
    );
    return `z.object({\n${fields.join("\n")}\n})`;
  }
  if (typeof value === "string") return "z.string()";
  if (typeof value === "number") return Number.isInteger(value) ? "z.number().int()" : "z.number()";
  return "z.boolean()";
}

function schemaFor(value: JsonValue): Record<string, unknown> {
  if (value === null) return { type: "null" };
  if (Array.isArray(value)) {
    if (!value.length) return { type: "array", items: {} };
    const schemas = value.map(schemaFor);
    const serialized = unique(schemas.map((schema) => JSON.stringify(schema))).map(
      (schema) => JSON.parse(schema) as Record<string, unknown>,
    );
    return {
      type: "array",
      items: serialized.length === 1 ? serialized[0] : { anyOf: serialized },
    };
  }
  if (typeof value === "object") {
    return {
      type: "object",
      properties: Object.fromEntries(
        Object.entries(value).map(([key, child]) => [key, schemaFor(child)]),
      ),
      required: Object.keys(value),
      additionalProperties: false,
    };
  }
  return { type: typeof value };
}

function deepSort(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(deepSort);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, child]) => [key, deepSort(child)]),
    );
  }
  return value;
}

function inspectJson(value: JsonValue) {
  const counts = { objects: 0, arrays: 0, strings: 0, numbers: 0, booleans: 0, nulls: 0 };
  let maxDepth = 0;
  const visit = (current: JsonValue, depth: number) => {
    maxDepth = Math.max(maxDepth, depth);
    if (current === null) counts.nulls += 1;
    else if (Array.isArray(current)) {
      counts.arrays += 1;
      current.forEach((item) => visit(item, depth + 1));
    } else if (typeof current === "object") {
      counts.objects += 1;
      Object.values(current).forEach((item) => visit(item, depth + 1));
    } else if (typeof current === "string") counts.strings += 1;
    else if (typeof current === "number") counts.numbers += 1;
    else counts.booleans += 1;
  };
  visit(value, 0);
  return [
    "✓ Valid JSON",
    "",
    `Root type: ${Array.isArray(value) ? "array" : value === null ? "null" : typeof value}`,
    `Maximum depth: ${maxDepth}`,
    `Objects: ${counts.objects}`,
    `Arrays: ${counts.arrays}`,
    `Strings: ${counts.strings}`,
    `Numbers: ${counts.numbers}`,
    `Booleans: ${counts.booleans}`,
    `Null values: ${counts.nulls}`,
  ].join("\n");
}

function tableRecords(value: JsonValue) {
  if (!Array.isArray(value) || !value.every((item) => item && typeof item === "object" && !Array.isArray(item))) {
    throw new Error("Expected an array of JSON objects.");
  }
  return value as Array<Record<string, JsonValue>>;
}

function displayCell(value: JsonValue | undefined) {
  if (value === undefined || value === null) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function jsonToHtml(value: JsonValue) {
  const records = tableRecords(value);
  const headers = unique(records.flatMap((record) => Object.keys(record)));
  const head = headers.map((header) => `      <th scope="col">${escapeHtml(header)}</th>`).join("\n");
  const body = records
    .map(
      (record) =>
        `    <tr>\n${headers
          .map((header) => `      <td>${escapeHtml(displayCell(record[header]))}</td>`)
          .join("\n")}\n    </tr>`,
    )
    .join("\n");
  return `<table>\n  <thead>\n    <tr>\n${head}\n    </tr>\n  </thead>\n  <tbody>\n${body}\n  </tbody>\n</table>`;
}

function markdownCell(value: JsonValue | undefined) {
  return displayCell(value).replaceAll("|", "\\|").replaceAll("\n", "<br>");
}

function jsonToMarkdown(value: JsonValue) {
  const records = tableRecords(value);
  const headers = unique(records.flatMap((record) => Object.keys(record)));
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...records.map((record) => `| ${headers.map((header) => markdownCell(record[header])).join(" | ")} |`),
  ].join("\n");
}

function utf8ToBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

function base64ToUtf8(value: string) {
  const normalized = value.trim().replace(/\s+/g, "");
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

function decodeHtml(value: string) {
  const element = document.createElement("textarea");
  element.innerHTML = value;
  return element.value;
}

function decodeJwtSegment(segment: string) {
  const normalized = segment.replaceAll("-", "+").replaceAll("_", "/");
  return JSON.parse(base64ToUtf8(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="))) as JsonValue;
}

function timestampReport(input: string) {
  const trimmed = input.trim();
  const numeric = Number(trimmed);
  let date: Date;
  if (trimmed && Number.isFinite(numeric)) {
    date = new Date(Math.abs(numeric) < 100_000_000_000 ? numeric * 1000 : numeric);
  } else {
    date = new Date(trimmed);
  }
  if (Number.isNaN(date.getTime())) throw new Error("Enter a valid Unix timestamp or date string.");
  return [
    `ISO 8601: ${date.toISOString()}`,
    `UTC: ${date.toUTCString()}`,
    `Local: ${date.toLocaleString()}`,
    `Unix seconds: ${Math.floor(date.getTime() / 1000)}`,
    `Unix milliseconds: ${date.getTime()}`,
  ].join("\n");
}

type RGB = { r: number; g: number; b: number };

function hslToRgb(h: number, s: number, l: number): RGB {
  const saturation = s / 100;
  const lightness = l / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const section = ((h % 360) + 360) % 360 / 60;
  const x = chroma * (1 - Math.abs((section % 2) - 1));
  const [r1, g1, b1] = section < 1 ? [chroma, x, 0] : section < 2 ? [x, chroma, 0] : section < 3 ? [0, chroma, x] : section < 4 ? [0, x, chroma] : section < 5 ? [x, 0, chroma] : [chroma, 0, x];
  const match = lightness - chroma / 2;
  return { r: Math.round((r1 + match) * 255), g: Math.round((g1 + match) * 255), b: Math.round((b1 + match) * 255) };
}

function rgbToHsl({ r, g, b }: RGB) {
  const [red, green, blue] = [r / 255, g / 255, b / 255];
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let hue = 0;
  if (delta) {
    if (max === red) hue = 60 * (((green - blue) / delta) % 6);
    else if (max === green) hue = 60 * ((blue - red) / delta + 2);
    else hue = 60 * ((red - green) / delta + 4);
  }
  if (hue < 0) hue += 360;
  const lightness = (max + min) / 2;
  const saturation = delta ? delta / (1 - Math.abs(2 * lightness - 1)) : 0;
  return { h: Math.round(hue), s: Math.round(saturation * 100), l: Math.round(lightness * 100) };
}

function parseColor(input: string): RGB {
  const value = input.trim().toLowerCase();
  const hex = value.match(/^#?([a-f\d]{3}|[a-f\d]{6})$/i)?.[1];
  if (hex) {
    const full = hex.length === 3 ? [...hex].map((character) => character + character).join("") : hex;
    return { r: parseInt(full.slice(0, 2), 16), g: parseInt(full.slice(2, 4), 16), b: parseInt(full.slice(4, 6), 16) };
  }
  const rgb = value.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/);
  if (rgb) {
    const result = { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]) };
    if (Object.values(result).some((part) => part > 255)) throw new Error("RGB values must be between 0 and 255.");
    return result;
  }
  const hsl = value.match(/^hsl\(\s*(-?[\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)$/);
  if (hsl) return hslToRgb(Number(hsl[1]), Number(hsl[2]), Number(hsl[3]));
  throw new Error("Use HEX (#6c5ce7), RGB (108, 92, 231) or HSL (247, 75%, 63%).");
}

function colorReport(input: string) {
  const rgb = parseColor(input);
  const hex = `#${[rgb.r, rgb.g, rgb.b].map((part) => part.toString(16).padStart(2, "0")).join("")}`;
  const hsl = rgbToHsl(rgb);
  return [`HEX: ${hex}`, `RGB: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, `HSL: hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`].join("\n");
}

function formatCss(input: string) {
  return input
    .replace(/\/\*[\s\S]*?\*\//g, (comment) => `${comment.trim()}\n`)
    .replace(/\s*{\s*/g, " {\n  ")
    .replace(/;\s*/g, ";\n  ")
    .replace(/\s*}\s*/g, "\n}\n\n")
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .replace(/\n\s+}/g, "\n}")
    .trim();
}

function minifyCss(input: string) {
  return input
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

export async function runTool(slug: string, input: string, options: TransformOptions = {}) {
  const indent = options.indent === 4 ? 4 : 2;
  const direction = options.direction ?? 0;

  switch (slug) {
    case "json-formatter":
      return JSON.stringify(parseJson(input), null, indent);
    case "json-validator":
      return inspectJson(parseJson(input));
    case "json-minifier":
      return JSON.stringify(parseJson(input));
    case "json-key-sorter":
      return JSON.stringify(deepSort(parseJson(input)), null, indent);
    case "json-to-typescript":
      return jsonToTypeScript(parseJson(input));
    case "json-to-zod":
      return `import { z } from "zod";\n\nexport const RootSchema = ${zodType(parseJson(input))};\n\nexport type Root = z.infer<typeof RootSchema>;`;
    case "json-to-json-schema":
      return JSON.stringify({ $schema: "https://json-schema.org/draft/2020-12/schema", title: "Root", ...schemaFor(parseJson(input)) }, null, indent);
    case "json-to-yaml":
      return yaml.dump(parseJson(input), { noRefs: true, lineWidth: 100, sortKeys: false });
    case "yaml-to-json":
      return JSON.stringify(yaml.load(input), null, indent);
    case "json-to-csv": {
      const records = tableRecords(parseJson(input)).map((record) =>
        Object.fromEntries(Object.entries(record).map(([key, value]) => [key, displayCell(value)])),
      );
      return Papa.unparse(records);
    }
    case "csv-to-json": {
      const result = Papa.parse<Record<string, string>>(input, { header: true, skipEmptyLines: "greedy" });
      if (result.errors.length) throw new Error(result.errors[0].message);
      return JSON.stringify(result.data, null, indent);
    }
    case "json-to-xml": {
      const value = parseJson(input);
      const source = value && typeof value === "object" && !Array.isArray(value) ? value : { root: value };
      return new XMLBuilder({ ignoreAttributes: false, format: true, suppressEmptyNode: false }).build(source);
    }
    case "xml-to-json":
      return JSON.stringify(new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@", trimValues: true }).parse(input), null, indent);
    case "json-to-html-table":
      return jsonToHtml(parseJson(input));
    case "json-to-markdown-table":
      return jsonToMarkdown(parseJson(input));
    case "url-encoder-decoder":
      return direction === 0 ? encodeURIComponent(input) : decodeURIComponent(input.trim());
    case "base64-encoder-decoder":
      return direction === 0 ? utf8ToBase64(input) : base64ToUtf8(input);
    case "html-entities":
      return direction === 0 ? escapeHtml(input) : decodeHtml(input);
    case "jwt-decoder": {
      const segments = input.trim().split(".");
      if (segments.length < 2) throw new Error("A JWT must contain a header and payload separated by periods.");
      return JSON.stringify({ header: decodeJwtSegment(segments[0]), payload: decodeJwtSegment(segments[1]), signature: segments[2] || "" }, null, indent);
    }
    case "unix-timestamp-converter":
      return timestampReport(input);
    case "color-converter":
      return colorReport(input);
    case "uuid-generator": {
      const count = Math.min(100, Math.max(1, Number.parseInt(input.trim(), 10) || 1));
      return Array.from({ length: count }, () => crypto.randomUUID()).join("\n");
    }
    case "sha256-hash": {
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
      return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
    }
    case "css-formatter-minifier":
      return direction === 0 ? formatCss(input) : minifyCss(input);
    default:
      throw new Error("This converter is not available.");
  }
}
