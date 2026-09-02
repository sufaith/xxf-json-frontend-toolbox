import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const out = new URL("../out/", import.meta.url);

async function html(path) {
  return readFile(new URL(path, out), "utf8");
}

function exportedHtmlPath(pathname) {
  if (pathname === "/") return "index.html";
  return `${pathname.replace(/^\//, "").replace(/\/$/, "")}/index.html`;
}

test("home page keeps the tool directory and adds useful editorial content below it", async () => {
  const source = await html("index.html");
  assert.match(source, /<h1 class="sr-only">XXF browser tools<\/h1>/i);
  assert.match(source, /aria-label="Tool categories"/i);
  assert.match(source, /class="category-tabs"/i);
  assert.match(source, /class="tool-card-grid"/i);
  assert.match(source, /site-footer__minimal/i);
  assert.doesNotMatch(source, /class="site-header/);
  assert.match(source, /JSON Formatter/);
  assert.match(source, /Image Compressor/);
  assert.match(source, /Photo Collage Maker/);
  assert.match(source, /URL Parser/);
  assert.match(source, /Redirect Checker/);
  assert.match(source, /M3U8 Video Player/);
  assert.match(source, /Video to M3U8/);
  assert.match(source, /Prehistoric Animal Museum/);
  assert.doesNotMatch(source, />Open tool</i);
  assert.match(source, /<link rel="canonical" href="https:\/\/xxf\.app\/"/i);
  assert.match(source, /<script async(?:="")? src="https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=ca-pub-5078282844971985" crossorigin="anonymous"><\/script>/i);
  assert.match(source, /og:image/);
  assert.equal((source.match(/<script type="application\/ld\+json">/g) ?? []).length, 2);
  assert.match(source, /WebSite/);
  assert.match(source, /WebPage/);
  assert.match(source, /ItemList/);
  assert.match(source, /Organization/);
  assert.match(source, /FAQPage/);
  assert.match(source, /class="trust-grid"/);
  assert.match(source, /class="guide-grid"/);
  assert.match(source, /class="home-faq-section"/);
  assert.match(source, /A useful result includes the edges/);
  assert.match(source, /href="\/guides\/">Browse all/);
  assert.match(source, /href="\/editorial-policy\/">Review standards/);
  assert.match(source, /publishingPrinciples/);
  assert.match(source, /lastReviewed/);
  assert.doesNotMatch(source, /workspace-hero|search-box|closing-cta/);
  assert.doesNotMatch(source, /codex-preview|react-loading-skeleton|Starter Project/);
});

test("all 30 tool pages are statically rendered with unique SEO signals", async () => {
  const directory = new URL("tools/", out);
  const slugs = (await readdir(directory, { withFileTypes: true })).filter((item) => item.isDirectory()).map((item) => item.name);
  assert.equal(slugs.length, 30);
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
    assert.match(source, new RegExp(`<link rel="canonical" href="https://xxf\\.app/tools/${slug}/"`, "i"));
    assert.match(source, /WebApplication/);
    assert.match(source, /WebPage/);
    assert.match(source, /BreadcrumbList/);
    assert.match(source, /Organization/);
    assert.match(source, /isAccessibleForFree/);
    assert.match(source, /publishingPrinciples/);
    assert.match(source, /lastReviewed/);
    assert.match(source, /<h1(?:\s[^>]*)?>/);
    assert.doesNotMatch(source, /<h1 class="sr-only">/);
    assert.match(source, /site-footer__minimal/);
    assert.match(source, /href="\/site-map\/">Sitemap<\/a>/);
    assert.match(source, /href="\/guides\/">Guides<\/a>/);
    assert.match(source, /href="\/editorial-policy\/">Editorial<\/a>/);
    assert.match(source, /href="\/about\/">About<\/a>/);
    assert.match(source, /href="\/contact\/">Contact<\/a>/);
    assert.match(source, /href="\/terms\/">Terms<\/a>/);
    assert.match(source, /href="\/privacy\/">Privacy Policy<\/a>/);
    assert.match(source, /HowTo/);
    assert.match(source, /FAQPage/);
    assert.match(source, /class="tool-editorial shell"/);
    assert.match(source, /class="step-list"/);
    assert.match(source, /class="worked-example"/);
    assert.match(source, /Worked example/);
    assert.match(source, /What to notice/);
    assert.match(source, /Reviewed September 2, 2026/);
    assert.match(source, /How XXF reviews tool guidance/);
    assert.match(source, /When this tool helps/);
    assert.match(source, /Accuracy and safety notes/);
    assert.match(source, /Frequently asked questions/);
    assert.match(source, /class="related-section"/);
    assert.match(source, /class="sidebar-card"/);
    assert.match(source, /class="editorial-guides"/);
    assert.doesNotMatch(source, /page-hero|workbench__topline|workbench__controls|convert-rail|workbench__footer/);
    assert.match(source, /dock-tool-switcher/);
    assert.match(source, /site-header__drag-handle/);
    assert.match(source, /移动悬浮导航/);
    assert.doesNotMatch(source, /<small>Guides<\/small>|<small>About<\/small>/);
    if (!["image-compressor", "photo-collage-maker", "m3u8-player", "video-to-m3u8"].includes(slug)) {
      assert.match(source, /Included sample input/);
    }
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
    } else if (slug === "url-parser") {
      assert.match(source, /URL Parser workspace/);
      assert.match(source, /Paste a URL to inspect/);
      assert.match(source, /query parameters/);
      assert.match(source, /url-parser-table/);
      assert.doesNotMatch(source, /editor-panel__head-tools|Redirect Checker workspace/);
    } else if (slug === "redirect-checker") {
      assert.match(source, /Redirect Checker workspace/);
      assert.match(source, /Check redirects/);
      assert.match(source, /Mac Chrome/);
      assert.match(source, /Android/);
      assert.match(source, /redirect-checker__empty/);
      assert.doesNotMatch(source, /editor-panel__head-tools|URL Parser workspace/);
    } else if (slug === "m3u8-player") {
      assert.match(source, /M3U8 Video Player workspace/);
      assert.match(source, /M3U8 stream URL/);
      assert.match(source, /Load stream/);
      assert.match(source, /Native HLS/);
      assert.match(source, /video-player__placeholder/);
      assert.doesNotMatch(source, /editor-panel__head-tools|Redirect Checker workspace/);
    } else if (slug === "video-to-m3u8") {
      assert.match(source, /Video to M3U8 workspace/);
      assert.match(source, /Drop a video here/);
      assert.match(source, /Convert to M3U8/);
      assert.match(source, /M3U8 playlist/);
      assert.doesNotMatch(source, /editor-panel__head-tools|M3U8 Video Player workspace/);
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
  assert.equal(titles.size, 30);
  assert.equal(descriptions.size, 30);
});

test("thirteen editorial guides include primary references and relevant tools", async () => {
  const directory = new URL("guides/", out);
  const slugs = (await readdir(directory, { withFileTypes: true })).filter((item) => item.isDirectory()).map((item) => item.name);
  assert.equal(slugs.length, 13);
  for (const slug of slugs) {
    const source = await html(`guides/${slug}/index.html`);
    assert.match(source, /TechArticle/);
    assert.match(source, /BreadcrumbList/);
    assert.match(source, /articleSection/);
    assert.match(source, /citation/);
    assert.match(source, /publishingPrinciples/);
    assert.match(source, /class="article-references"/);
    assert.match(source, /Primary references/);
    assert.match(source, /class="article-tool-links"/);
    assert.match(source, /href="\/tools\//);
    assert.match(source, /href="\/guides\/">Guides<\/a>/);
    assert.match(source, /By XXF Tools/);
    assert.match(source, /Implementation-checked by the XXF Tools editorial team/);
    assert.match(source, new RegExp(`https://xxf\\.app/guides/${slug}/`));
  }
});

test("guide hub exposes every article by topic", async () => {
  const source = await html("guides/index.html");
  assert.match(source, /CollectionPage/);
  assert.match(source, /Use the tool/);
  assert.match(source, /Understand the edge/);
  assert.match(source, /Primary references included/);
  assert.match(source, /Editorial method/);
  assert.match(source, /Read the full review standards/);
  assert.equal((source.match(/class="guide-index-card"/g) ?? []).length, 13);
  assert.match(source, /https:\/\/xxf\.app\/guides\//);
});

test("crawler and app files expose the complete canonical surface", async () => {
  const [sitemap, robots, manifest, llms, ads] = await Promise.all([
    readFile(new URL("sitemap.xml", out), "utf8"),
    readFile(new URL("robots.txt", out), "utf8"),
    readFile(new URL("manifest.webmanifest", out), "utf8"),
    readFile(new URL("llms.txt", out), "utf8"),
    readFile(new URL("ads.txt", out), "utf8"),
  ]);
  assert.equal((sitemap.match(/<url>/g) ?? []).length, 52);
  assert.match(sitemap, /https:\/\/xxf\.app\/animal\//);
  assert.match(sitemap, /https:\/\/xxf\.app\/site-map\//);
  assert.match(sitemap, /https:\/\/xxf\.app\/contact\//);
  assert.match(sitemap, /https:\/\/xxf\.app\/guides\//);
  assert.match(sitemap, /https:\/\/xxf\.app\/editorial-policy\//);
  assert.match(robots, /Sitemap: https:\/\/xxf\.app\/sitemap\.xml/);
  assert.match(manifest, /XXF JSON, Frontend & Video Tools/);
  assert.match(llms, /Text, image and video conversions run locally/);
  assert.match(llms, /Contact and public issue tracker/);
  assert.match(llms, /Link-accessible \/n\/ note spaces/);
  assert.match(llms, /Editorial standards and review process/);
  assert.equal(ads.trim(), "google.com, pub-5078282844971985, DIRECT, f08c47fec0942fa0");
  assert.match(manifest, /Private browser-based JSON, frontend, image and video tools/);
  await Promise.all(["og.jpg", "animal-museum-hero.jpg", "icon-192.png", "icon-512.png", "favicon.ico", "ads.txt"].map((asset) => access(new URL(asset, out))));
});

test("editorial and privacy pages disclose review and data boundaries", async () => {
  const [editorial, privacy, about, terms] = await Promise.all([
    html("editorial-policy/index.html"),
    html("privacy/index.html"),
    html("about/index.html"),
    html("terms/index.html"),
  ]);
  assert.match(editorial, /Editorial standards/);
  assert.match(editorial, /How a tool page is reviewed/);
  assert.match(editorial, /Advertising independence/);
  assert.match(editorial, /lastReviewed/);
  assert.match(editorial, /reviewedBy/);
  assert.match(privacy, /Shared note spaces/);
  assert.match(privacy, /Google advertising and cookies/);
  assert.match(privacy, /policies\.google\.com\/technologies\/partner-sites/);
  assert.match(privacy, /adssettings\.google\.com/);
  assert.match(about, /Maintained by XXF Tools/);
  assert.match(about, /href="\/editorial-policy\/">editorial standards page<\/a>/);
  assert.match(terms, /Shared spaces/);
});

test("prehistoric animal museum has its own indexable experience page", async () => {
  const source = await html("animal/index.html");
  assert.match(source, /<title>Prehistoric Animal Museum — Interactive Natural History \| XXF Tools<\/title>/i);
  assert.match(source, /href="https:\/\/xxf\.app\/animal\//i);
  assert.match(source, /Prehistoric Animal Museum/);
  assert.match(source, /18/);
  assert.match(source, /animal-museum-hero\.jpg/);
  assert.doesNotMatch(source, /_next\/image\/\?url=/);
  assert.match(source, /CollectionPage/);
  assert.match(source, /Tyrannosaurus/);
  assert.match(source, /Triceratops/);
  assert.match(source, /中文/);
  assert.doesNotMatch(source, /site-header/);
});

test("performance hints and image previews are present", async () => {
  const [adsense, compressor, globals] = await Promise.all([
    readFile(new URL("../components/AdSenseScript.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/ImageCompressorWorkbench.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(adsense, /rel="preconnect" href="https:\/\/pagead2\.googlesyndication\.com"/);
  assert.match(adsense, /rel="dns-prefetch" href="https:\/\/pagead2\.googlesyndication\.com"/);
  assert.match(compressor, /alt=\{source\.file\.name\} loading="lazy" decoding="async"/);
  assert.doesNotMatch(adsense, /og\.png/);
  assert.doesNotMatch(compressor, /alt=""/);
  assert.match(globals, /font-weight: 450/);
  assert.match(globals, /-webkit-font-smoothing: antialiased/);
  assert.match(globals, /font-variant-ligatures: none/);
  assert.match(globals, /\.primary-button \{[^}]*box-shadow: none;/);
  assert.match(globals, /\.primary-button:focus-visible, \.ghost-button:focus-visible/);
});

test("HTML sitemap exposes every tool and guide through crawlable links", async () => {
  const source = await html("site-map/index.html");
  assert.match(source, /<h1>Everything on XXF\.<\/h1>/);
  assert.match(source, /href="\/sitemap\.xml">XML Sitemap<\/a>/);
  assert.match(source, /href="\/editorial-policy\/">Editorial Standards<\/a>/);
  for (const slug of (await readdir(new URL("tools/", out), { withFileTypes: true })).filter((item) => item.isDirectory()).map((item) => item.name)) {
    assert.match(source, new RegExp(`href="/tools/${slug}/"`));
  }
  for (const slug of (await readdir(new URL("guides/", out), { withFileTypes: true })).filter((item) => item.isDirectory()).map((item) => item.name)) {
    assert.match(source, new RegExp(`href="/guides/${slug}/"`));
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
  assert.match(source, /script-src[^;]*https:\/\/static\.cloudflareinsights\.com/);
  assert.match(source, /connect-src[^;]*https:/);
  assert.match(source, /media-src[^;]*blob:/);
  assert.match(source, /worker-src 'self' blob:/);
  assert.match(source, /frame-src[^;]*https:\/\/\*\.doubleclick\.net/);
  assert.match(source, /location = \/api\/check-redirects/);
  assert.match(source, /proxy_pass https:\/\/u\.xxf\.app\/api\/check-redirects/);
  assert.match(source, /location ~ \^\/api\/n\/\[\^\/\]\+\/\?\$ \{/);
  assert.match(source, /proxy_pass https:\/\/xxf-json-frontend-tools\.xxfapp\.chatgpt\.site;/);
  assert.match(source, /server_name xxf\.app;/);
  assert.match(source, /server_name www\.xxf\.app;[\s\S]*return 301 https:\/\/xxf\.app\$request_uri;/);
  assert.match(source, /location ~ \^\/n\/\[\^\/\]\+\/\?\$ \{/);
  assert.match(source, /add_header X-Robots-Tag "noindex, nofollow, noarchive" always;/);
  assert.match(source, /try_files \/n\/welcome\/index\.html =404/);
});

test("AdSense stays off private, navigational and error-only screens", async () => {
  const [home, tool, note, siteMap, notFound] = await Promise.all([
    html("index.html"),
    html("tools/json-formatter/index.html"),
    html("n/welcome/index.html"),
    html("site-map/index.html"),
    html("404.html"),
  ]);
  const adScript = /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/i;
  assert.match(home, adScript);
  assert.match(tool, adScript);
  assert.doesNotMatch(note, adScript);
  assert.doesNotMatch(siteMap, adScript);
  assert.doesNotMatch(notFound, adScript);
  assert.match(note, /<meta name="robots" content="noindex, nofollow"/i);
});

test("every indexable page has unique metadata and an intentional ad decision", async () => {
  const sitemap = await readFile(new URL("sitemap.xml", out), "utf8");
  const paths = [...sitemap.matchAll(/<loc>https:\/\/xxf\.app(.*?)<\/loc>/g)].map((match) => match[1]);
  const titles = new Set();
  const descriptions = new Set();
  const canonicals = new Set();
  const adScript = /<script async(?:="")? src="https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=ca-pub-5078282844971985" crossorigin="anonymous"><\/script>/i;

  assert.equal(paths.length, 52);
  for (const pathname of paths) {
    const source = await html(exportedHtmlPath(pathname));
    const title = source.match(/<title>(.*?)<\/title>/i)?.[1];
    const description = source.match(/<meta name="description" content="(.*?)"/i)?.[1];
    const canonical = source.match(/<link rel="canonical" href="(.*?)"/i)?.[1];
    assert.ok(title, `${pathname} has a title`);
    assert.ok(description, `${pathname} has a description`);
    assert.equal(canonical, `https://xxf.app${pathname}`);
    assert.match(source, /<h1(?:\s[^>]*)?>/i, `${pathname} has an H1`);
    assert.equal(titles.has(title), false, `${pathname} has a unique title`);
    assert.equal(descriptions.has(description), false, `${pathname} has a unique description`);
    assert.equal(canonicals.has(canonical), false, `${pathname} has a unique canonical`);
    titles.add(title);
    descriptions.add(description);
    canonicals.add(canonical);
    if (pathname === "/site-map/") assert.doesNotMatch(source, adScript);
    else assert.match(source, adScript, `${pathname} includes the approved site script`);
  }
});

test("crawlable internal links resolve to exported pages or public files", async () => {
  const sitemap = await readFile(new URL("sitemap.xml", out), "utf8");
  const paths = [...sitemap.matchAll(/<loc>https:\/\/xxf\.app(.*?)<\/loc>/g)].map((match) => match[1]);
  const checked = new Set();

  for (const pathname of paths) {
    const source = await html(exportedHtmlPath(pathname));
    for (const match of source.matchAll(/href="(\/[^"#?]*)[^\"]*"/g)) {
      const href = match[1];
      if (checked.has(href) || href.startsWith("/_next/") || href.startsWith("/api/")) continue;
      checked.add(href);
      const target = href === "/" ? "index.html" : /\.[a-z0-9]+$/i.test(href) ? href.slice(1) : exportedHtmlPath(href);
      await access(new URL(target, out));
    }
  }
  assert.ok(checked.size >= 50, "the link audit covers the public navigation surface");
});

test("redirect checker keeps its server boundary explicit", async () => {
  const source = await readFile(new URL("../app/api/check-redirects/route.ts", import.meta.url), "utf8");
  assert.match(source, /redirect: "manual"/);
  assert.match(source, /AbortSignal\.timeout\(10000\)/);
  assert.match(source, /isBlockedHost/);
  assert.match(source, /status: response\.status/);
});

test("M3U8 player loads HLS support only when a stream is requested", async () => {
  const source = await readFile(new URL("../components/M3u8PlayerWorkbench.tsx", import.meta.url), "utf8");
  assert.match(source, /canPlayType\("application\/vnd\.apple\.mpegurl"\)/);
  assert.match(source, /Hls\.isSupported\(\)/);
  assert.match(source, /import\("hls\.js"\)/);
  assert.match(source, /controls playsInline/);
  assert.match(source, /crossOrigin="anonymous"/);
  assert.match(source, /CORS/);
});

test("named spaces use durable storage and an auto-saving full-screen editor", async () => {
  const [hosting, worker, schema, page, component, chrome] = await Promise.all([
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../worker/index.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0000_note_spaces.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/n/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/NoteSpaceWorkbench.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/SiteChrome.tsx", import.meta.url), "utf8"),
  ]);
  assert.equal(JSON.parse(hosting).d1, "DB");
  assert.match(schema, /CREATE TABLE IF NOT EXISTS note_spaces/);
  assert.match(worker, /handleNoteSpaceRequest\(request, env\.DB\)/);
  assert.match(page, /dynamicParams = false/);
  assert.match(component, /fetch\(spaceApiUrl\(activeSpaceName\), \{ cache: "no-store" \}/);
  assert.match(component, /setTimeout\(\(\) => save\(content, version\), 500\)/);
  assert.match(component, /anyone with this link can access this space/);
  assert.match(chrome, /pathname\.startsWith\("\/n\/"\)/);
  assert.match(worker, /rewrittenUrl\.pathname = "\/n\/welcome\/"/);
});

test("video to M3U8 conversion stays local and packages HLS output", async () => {
  const source = await readFile(new URL("../components/VideoToM3u8Workbench.tsx", import.meta.url), "utf8");
  assert.match(source, /import\("@ffmpeg\/ffmpeg"\)/);
  assert.match(source, /import\("@ffmpeg\/util"\)/);
  assert.match(source, /-f", "hls"/);
  assert.match(source, /playlist\.m3u8/);
  assert.match(source, /segment-\\d\+\\.ts/);
  assert.match(source, /Download HLS package/);
  assert.match(source, /Nothing is uploaded|nothing is uploaded/);
});
