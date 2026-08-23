# XXF Tools

XXF Tools is a privacy-first JSON, frontend and image toolbox deployed at [www.xxf.app](https://www.xxf.app/).

## Product

- 26 browser-based developer and creative tools
- JSON formatting, validation, minification and key sorting
- TypeScript, Zod and JSON Schema generation
- JSON conversion for YAML, CSV, XML, HTML and Markdown
- URL, Base64, HTML entity, JWT, timestamp, color, UUID, hash and CSS utilities
- A browser-local photo collage maker with 1–16 image layouts, annotations, watermarks and JPG/PNG export
- Dedicated SEO landing pages and practical technical guides
- Local-only conversion: editor contents are never uploaded

## Development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
npm test
npm run build
```

`npm test` creates the static production export and verifies every tool page, guide, canonical URL, structured-data surface and crawler file.

## Deployment

Pushes to `main` run lint, tests and a static build before publishing an atomic release to the production server. Nginx serves the active release behind Cloudflare Full (strict) TLS.
