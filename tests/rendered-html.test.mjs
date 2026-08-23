import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const out = new URL("../out/", import.meta.url);

async function html(path) {
  return readFile(new URL(path, out), "utf8");
}

test("home page renders only the category tabs, tool cards and SEO metadata", async () => {
  const source = await html("index.html");
  assert.match(source, /<h1 class="sr-only">XXF browser tools<\/h1>/i);
  assert.match(source, /aria-label="Tool categories"/i);
  assert.match(source, /class="category-tabs"/i);
  assert.match(source, /class="tool-card-grid"/i);
  assert.match(source, /site-footer__minimal/i);
  assert.match(source, /JSON Formatter/);
  assert.match(source, /Image Compressor/);
  assert.match(source, /Photo Collage Maker/);
  assert.doesNotMatch(source, />Open tool</i);
  assert.match(source, /<link rel="canonical" href="https:\/\/www\.xxf\.app\/"/i);
  assert.match(source, /<script async(?:="")? src="https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=ca-pub-5078282844971985" crossorigin="anonymous"><\/script>/i);
  assert.match(source, /og:image/);
  assert.equal((source.match(/<script type="application\/ld\+json">/g) ?? []).length, 1);
  assert.match(source, /WebSite/);
  assert.match(source, /WebPage/);
  assert.match(source, /ItemList/);
  assert.match(source, /Organization/);
  assert.doesNotMatch(source, /workspace-hero|search-box|trust-grid|guide-grid|FAQPage|closing-cta/);
  assert.doesNotMatch(source, /codex-preview|react-loading-skeleton|Starter Project/);
});

test("all 26 tool pages are statically rendered with unique SEO signals", async () => {
  const directory = new URL("tools/", out);
  const slugs = (await readdir(directory, { withFileTypes: true })).filter((item) => item.isDirectory()).map((item) => item.name);
  assert.equal(slugs.length, 26);
  const titles = new Set();
  const descriptions = new Set();
  for (const slug of slugs) {
    const source = await html(`tools/${slug}/index.html`);
    const title = source.match(/<title>(.*?)<\/title>/i)?.[1];
    const description = source.match(/<meta name="description" content="(.*?)"/i)?.[1];
    assert.ok(title, `${slug} has a title`);
    assert.ok(description, `${slug} has a description`);
    titles.add(title);
    descriptions.add(description);
    assert.match(source, new RegExp(`<link rel="canonical" href="https://www\\.xxf\\.app/tools/${slug}/"`, "i"));
    assert.match(source, /WebApplication/);
    assert.match(source, /WebPage/);
    assert.match(source, /BreadcrumbList/);
    assert.match(source, /Organization/);
    assert.match(source, /isAccessibleForFree/);
    assert.match(source, /<h1(?:\s[^>]*)?>/);
    assert.doesNotMatch(source, /<h1 class="sr-only">/);
    assert.match(source, /site-footer__minimal/);
    assert.match(source, /href="\/site-map\/">Sitemap<\/a>/);
    assert.match(source, /href="\/privacy\/">Privacy Policy<\/a>/);
    assert.doesNotMatch(source, /HowTo|FAQPage|content-grid|related-section|sidebar-card|Frequently asked questions/);
    assert.doesNotMatch(source, /page-hero|workbench__topline|workbench__controls|convert-rail|workbench__footer/);
    assert.match(source, /dock-tool-switcher/);
    assert.match(source, /site-header__drag-handle/);
    assert.match(source, /移动悬浮导航/);
    assert.doesNotMatch(source, /<small>Guides<\/small>|<small>About<\/small>/);
    if (slug === "image-compressor") {
      assert.match(source, /Image Compressor workspace/);
      assert.match(source, /Drop images here/);
      assert.match(source, /Smart automatically keeps the smallest result/);
      assert.match(source, /Download all/);
      assert.match(source, /Nothing is uploaded/);
      assert.match(source, /image\/png,image\/jpeg,image\/webp/);
      assert.match(source, /<select/);
      assert.doesNotMatch(source, /editor-panel__head-tools|output-viewer|Photo Collage Maker workspace/);
    } else if (slug === "photo-collage-maker") {
      assert.match(source, /Photo Collage Maker workspace/);
      assert.match(source, /Layout presets/);
      assert.match(source, /Download image/);
      assert.match(source, /Interactive collage canvas/);
      assert.match(source, /Custom grid/);
    } else {
      assert.doesNotMatch(source, /<select/);
      assert.match(source, /editor-panel__head-tools/);
      assert.match(source, /editor-toolbar/);
      assert.match(source, /data-tooltip="显示行号"/);
      assert.match(source, /data-tooltip="复制"/);
      assert.match(source, /output-viewer/);
    }
    if (slug === "json-formatter") {
      assert.ok(source.includes("\\u003e"));
      assert.match(source, /保留转义（Encode）/);
      assert.match(source, /tool-icon--copy/);
      assert.match(source, /fold-icon--collapse/);
    }
  }
  assert.equal(titles.size, 26);
  assert.equal(descriptions.size, 26);
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
  assert.equal((sitemap.match(/<url>/g) ?? []).length, 37);
  assert.match(sitemap, /https:\/\/www\.xxf\.app\/site-map\//);
  assert.match(robots, /Sitemap: https:\/\/www\.xxf\.app\/sitemap\.xml/);
  assert.match(manifest, /XXF JSON & Frontend Tools/);
  assert.match(llms, /All conversions run locally/);
  await Promise.all(["og.png", "icon-192.png", "icon-512.png", "favicon.ico"].map((asset) => access(new URL(asset, out))));
});

test("HTML sitemap exposes every tool through crawlable links", async () => {
  const source = await html("site-map/index.html");
  assert.match(source, /<h1>Everything on XXF\.<\/h1>/);
  assert.match(source, /href="\/sitemap\.xml">XML Sitemap<\/a>/);
  for (const slug of (await readdir(new URL("tools/", out), { withFileTypes: true })).filter((item) => item.isDirectory()).map((item) => item.name)) {
    assert.match(source, new RegExp(`href="/tools/${slug}/"`));
  }
});

test("tool workspaces and the floating dock use the requested viewport insets", async () => {
  const source = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(source, /\.site-header \{[^}]*right: 10px; bottom: 10px;/);
  assert.match(source, /\.tool-page-workbench \{[^}]*width: calc\(100% - 12px\);[^}]*margin-inline: 6px; padding-block: 6px;/);
  assert.match(source, /\.photo-tool-page \{[^}]*width: calc\(100% - 12px\);[^}]*margin: 0 6px; padding-block: 6px;/);
  assert.match(source, /\.photo-collage-workbench \{[^}]*min-height: calc\(100svh - 12px\);/);
  assert.match(source, /\.image-compressor-page \{[^}]*width: calc\(100% - 12px\);[^}]*margin: 0 6px; padding-block: 6px;/);
  assert.match(source, /\.image-compressor-workbench \{[^}]*min-height: calc\(100svh - 12px\);/);
  assert.match(source, /inset: auto 10px 10px auto !important;/);
  assert.doesNotMatch(source, /\.home-tool-directory \+ \.site-footer \{ display: none; \}/);
  assert.match(source, /\.site-footer__minimal \{[^}]*min-height: 32px;/);
});

test("floating dock resets after reload and closes its switcher outside", async () => {
  const source = await readFile(new URL("../components/SiteChrome.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /localStorage|xxf-dock-position/);
  assert.match(source, /document\.addEventListener\("pointerdown", closeOnOutsideClick\)/);
  assert.match(source, /switcher\.contains\(event\.target\)/);
  assert.match(source, /switcher\.open = false/);
  assert.match(source, /event\.key !== "Escape"/);
});

test("public host security policy allows the configured AdSense domains", async () => {
  const source = await readFile(new URL("../deploy/nginx-xxf.conf", import.meta.url), "utf8");
  assert.match(source, /script-src[^;]*https:\/\/\*\.googlesyndication\.com/);
  assert.match(source, /frame-src[^;]*https:\/\/\*\.doubleclick\.net/);
});
