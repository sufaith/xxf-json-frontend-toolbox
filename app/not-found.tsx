import Link from "next/link";

export default function NotFound() {
  return <main className="legal-page"><div className="legal-page__inner shell"><span className="kicker">404 · value not found</span><h1>This route didn’t parse.</h1><p>The page may have moved, but the toolbox is ready.</p><Link className="primary-button primary-button--large" href="/">Return to XXF Tools <span>↗</span></Link></div></main>;
}
