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
  assert.match(source, /JSON Formatter/);
  assert.match(source, /Photo Collage Maker/);
  assert.doesNotMatch(source, />Open tool</i);
  assert.match(source, /<link rel="canonical" href="https:\/\/www\.xxf\.app\/"/i);
  assert.match(source, /<script async(?:="")? src="https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=ca-pub-5078282844971985" crossorigin="anonymous"><\/script>/i);
  assert.match(source, /og:image/);
  assert.equal((source.match(/<script type="application\/ld\+json">/g) ?? []).length, 2);
  assert.match(source, /WebSite/);
  assert.match(source, /WebApplication/);
  assert.doesNotMatch(source, /workspace-hero|search-box|trust-grid|guide-grid|FAQPage|closing-cta/);
  assert.doesNotMatch(source, /codex-preview|react-loading-skeleton|Starter Project/);
});

test("all 25 tool pages are statically rendered with unique SEO signals", async () => {
  const directory = new URL("tools/", out);
  const slugs = (await readdir(directory, { withFileTypes: true })).filter((item) => item.isDirectory()).map((item) => item.name);
  assert.equal(slugs.length, 25);
  const titles = new Set();
  for (const slug of slugs) {
    const source = await html(`tools/${slug}/index.html`);
    const title = source.match(/<title>(.*?)<\/title>/i)?.[1];
    assert.ok(title, `${slug} has a title`);
    titles.add(title);
    assert.match(source, new RegExp(`<link rel="canonical" href="https://www\\.xxf\\.app/tools/${slug}/"`, "i"));
    assert.match(source, /SoftwareApplication/);
    assert.match(source, /<h1 class="sr-only">/);
    assert.match(source, /site-footer__minimal/);
    assert.match(source, /href="\/sitemap\.xml">Sitemap<\/a>/);
    assert.match(source, /href="\/privacy\/">Privacy Policy<\/a>/);
    assert.doesNotMatch(source, /HowTo|FAQPage|BreadcrumbList|content-grid|related-section|sidebar-card|Frequently asked questions/);
    assert.doesNotMatch(source, /page-hero|workbench__topline|workbench__controls|convert-rail|workbench__footer|<select/);
    assert.match(source, /dock-tool-switcher/);
    assert.match(source, /site-header__drag-handle/);
    assert.match(source, /移动悬浮导航/);
    if (slug === "photo-collage-maker") {
      assert.match(source, /Photo Collage Maker workspace/);
      assert.match(source, /Layout presets/);
      assert.match(source, /Download image/);
      assert.match(source, /Interactive collage canvas/);
      assert.match(source, /Custom grid/);
    } else {
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
  assert.equal(titles.size, 25);
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
  assert.equal((sitemap.match(/<url>/g) ?? []).length, 35);
  assert.match(robots, /Sitemap: https:\/\/www\.xxf\.app\/sitemap\.xml/);
  assert.match(manifest, /XXF JSON & Frontend Tools/);
  assert.match(llms, /All conversions run locally/);
  await Promise.all(["og.png", "icon-192.png", "icon-512.png", "favicon.ico"].map((asset) => access(new URL(asset, out))));
});
