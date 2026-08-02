import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const out = new URL("../out/", import.meta.url);

async function html(path) {
  return readFile(new URL(path, out), "utf8");
}

test("home page renders the product, privacy promise and SEO metadata", async () => {
  const source = await html("index.html");
  assert.match(source, /<h1[^>]*>JSON in\./i);
  assert.match(source, /Frontend-ready/);
  assert.match(source, /24 tools/);
  assert.match(source, /Local processing/);
  assert.match(source, /JSON Formatter workspace/);
  assert.match(source, /<link rel="canonical" href="https:\/\/www\.xxf\.app\/"/i);
  assert.match(source, /og:image/);
  assert.ok((source.match(/application\/ld\+json/g) ?? []).length >= 3);
  assert.match(source, /WebSite/);
  assert.match(source, /WebApplication/);
  assert.match(source, /FAQPage/);
  assert.doesNotMatch(source, /codex-preview|react-loading-skeleton|Starter Project/);
});

test("all 24 tool pages are statically rendered with unique SEO signals", async () => {
  const directory = new URL("tools/", out);
  const slugs = (await readdir(directory, { withFileTypes: true })).filter((item) => item.isDirectory()).map((item) => item.name);
  assert.equal(slugs.length, 24);
  const titles = new Set();
  for (const slug of slugs) {
    const source = await html(`tools/${slug}/index.html`);
    const title = source.match(/<title>(.*?)<\/title>/i)?.[1];
    assert.ok(title, `${slug} has a title`);
    titles.add(title);
    assert.match(source, new RegExp(`<link rel="canonical" href="https://www\\.xxf\\.app/tools/${slug}/"`, "i"));
    assert.match(source, /SoftwareApplication/);
    assert.match(source, /HowTo/);
    assert.match(source, /FAQPage/);
  }
  assert.equal(titles.size, 24);
});

test("six editorial guides are statically rendered as technical articles", async () => {
  const directory = new URL("guides/", out);
  const slugs = (await readdir(directory, { withFileTypes: true })).filter((item) => item.isDirectory()).map((item) => item.name);
  assert.equal(slugs.length, 6);
  for (const slug of slugs) {
    const source = await html(`guides/${slug}/index.html`);
    assert.match(source, /TechArticle/);
    assert.match(source, /BreadcrumbList/);
    assert.match(source, new RegExp(`https://www\\.xxf\\.app/guides/${slug}/`));
  }
});

test("crawler and app files expose the complete canonical surface", async () => {
  const [sitemap, robots, manifest, llms] = await Promise.all([
    readFile(new URL("sitemap.xml", out), "utf8"),
    readFile(new URL("robots.txt", out), "utf8"),
    readFile(new URL("manifest.webmanifest", out), "utf8"),
    readFile(new URL("llms.txt", out), "utf8"),
  ]);
  assert.equal((sitemap.match(/<url>/g) ?? []).length, 34);
  assert.match(robots, /Sitemap: https:\/\/www\.xxf\.app\/sitemap\.xml/);
  assert.match(manifest, /XXF JSON & Frontend Tools/);
  assert.match(llms, /All conversions run locally/);
  await Promise.all(["og.png", "icon-192.png", "icon-512.png", "favicon.ico"].map((asset) => access(new URL(asset, out))));
});
