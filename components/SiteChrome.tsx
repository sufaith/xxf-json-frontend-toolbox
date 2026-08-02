import Link from "next/link";
import { tools } from "@/lib/tools";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <nav aria-label="Primary navigation">
          <Link href="/" aria-label="XXF Tools home"><span aria-hidden="true">⌂</span><small>Home</small></Link>
          <details className="dock-tool-switcher">
            <summary aria-label="Switch tool"><span aria-hidden="true">{`{}`}</span><small>Switch tool</small></summary>
            <div className="dock-tool-menu">
              <div className="dock-tool-menu__head"><b>Switch tool</b><span>{tools.length} local tools</span></div>
              <div className="dock-tool-menu__list">
                {tools.map((tool) => <Link href={`/tools/${tool.slug}/`} key={tool.slug}><span>{tool.name}</span><em>{tool.category}</em></Link>)}
              </div>
            </div>
          </details>
          <Link href="/#guides"><span aria-hidden="true">≡</span><small>Guides</small></Link>
          <Link href="/about/"><span aria-hidden="true">i</span><small>About</small></Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell site-footer__grid">
        <div>
          <Link className="brand brand--footer" href="/">
            <span className="brand__mark">X<span>X</span>F</span>
            <span className="brand__copy"><b>XXF Tools</b><small>JSON + FRONTEND</small></span>
          </Link>
          <p>Fast developer converters that keep your data on your device.</p>
        </div>
        <div>
          <strong>Popular tools</strong>
          <Link href="/tools/json-formatter/">JSON Formatter</Link>
          <Link href="/tools/json-to-typescript/">JSON to TypeScript</Link>
          <Link href="/tools/json-to-yaml/">JSON to YAML</Link>
          <Link href="/tools/jwt-decoder/">JWT Decoder</Link>
        </div>
        <div>
          <strong>XXF</strong>
          <Link href="/about/">About</Link>
          <Link href="/privacy/">Privacy</Link>
          <Link href="/terms/">Terms</Link>
          <Link href="/sitemap.xml">Sitemap</Link>
        </div>
      </div>
      <div className="shell site-footer__bottom"><span>© 2026 XXF Tools</span><span>Built for the browser · No sign-up · No uploads</span></div>
    </footer>
  );
}
