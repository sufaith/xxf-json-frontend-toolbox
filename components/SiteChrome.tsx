import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner shell">
        <Link className="brand" href="/" aria-label="XXF Tools home">
          <span className="brand__mark">X<span>X</span>F</span>
          <span className="brand__copy"><b>XXF Tools</b><small>JSON + FRONTEND</small></span>
        </Link>
        <nav aria-label="Primary navigation">
          <Link href="/#tools">All tools</Link>
          <Link href="/#guides">Guides</Link>
          <Link href="/about/">About</Link>
        </nav>
        <Link className="header-cta" href="/tools/json-formatter/">Open formatter <span>↗</span></Link>
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
