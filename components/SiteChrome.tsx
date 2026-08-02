import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand" href="/" aria-label="XXF Tools home">
          <span className="brand__mark">X<span>X</span>F</span>
          <span className="brand__copy"><b>XXF Tools</b><small>JSON + FRONTEND</small></span>
        </Link>
        <nav aria-label="Primary navigation">
          <Link href="/#tools"><span aria-hidden="true">{`{}`}</span><small>Tools</small></Link>
          <Link href="/#guides"><span aria-hidden="true">≡</span><small>Guides</small></Link>
          <Link href="/about/"><span aria-hidden="true">i</span><small>About</small></Link>
        </nav>
        <Link className="header-cta" href="/tools/json-formatter/" aria-label="Open JSON Formatter"><span>J</span><small>Format</small></Link>
        <span className="rail-status"><i /> Local</span>
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
