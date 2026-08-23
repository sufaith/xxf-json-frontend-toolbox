"use client";

import { useState } from "react";

type RedirectResult = { url: string; status: number | string };

const userAgents = [
  ["default", "Default"],
  ["mac-chrome", "Mac Chrome"],
  ["windows-chrome", "Win Chrome"],
  ["iphone", "iPhone"],
  ["android", "Android"],
] as const;

export function RedirectCheckerWorkbench() {
  const [input, setInput] = useState("");
  const [userAgent, setUserAgent] = useState("default");
  const [results, setResults] = useState<RedirectResult[]>([]);
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  async function checkRedirects(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim()) return;
    setIsChecking(true);
    setError("");
    setResults([]);
    try {
      const response = await fetch("/api/check-redirects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: input.trim(), userAgent }) });
      const payload = await response.json() as { results?: RedirectResult[]; error?: string };
      if (!response.ok) throw new Error(payload.error || "Redirect check failed.");
      setResults(payload.results ?? []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Redirect check failed.");
    } finally {
      setIsChecking(false);
    }
  }

  async function copyUrl(index: number, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(index);
      window.setTimeout(() => setCopied((current) => current === index ? null : current), 1600);
    } catch {
      setCopied(null);
    }
  }

  return (
    <section className="utility-workbench utility-workbench--redirect-checker" aria-label="Redirect Checker workspace">
      <header className="utility-workbench__hero">
        <div><span className="utility-workbench__eyebrow">Frontend · Trace HTTP redirects</span><h1>Redirect Checker</h1><p>Trace a URL&apos;s redirect chain and compare responses for common browser user agents.</p></div>
      </header>
      <form className="redirect-checker__form" onSubmit={checkRedirects}>
        <label htmlFor="redirect-checker-input">URL to check</label>
        <div className="redirect-checker__input-row"><input id="redirect-checker-input" value={input} onChange={(event) => setInput(event.target.value)} placeholder="https://example.com" spellCheck={false} /><button className="primary-button" type="submit" disabled={!input.trim() || isChecking}>{isChecking ? "Checking…" : "Check redirects"}</button></div>
        <div className="redirect-checker__agents" aria-label="Browser user agent">
          {userAgents.map(([value, label]) => <label key={value} className={userAgent === value ? "is-active" : ""}><input type="radio" name="redirect-user-agent" value={value} checked={userAgent === value} onChange={() => setUserAgent(value)} disabled={isChecking} /><span>{label}</span></label>)}
        </div>
      </form>
      {error ? <p className="utility-workbench__error" role="alert">{error}</p> : null}
      {results.length ? (
        <div className="redirect-checker__results" aria-live="polite">
          <div className="utility-workbench__output-head"><span>Redirect chain</span><small>{results.length} {results.length === 1 ? "response" : "responses"}</small></div>
          <ol className="redirect-checker__chain">
            {results.map((result, index) => <li key={`${result.url}-${index}`}><span className="redirect-checker__number">{String(index + 1).padStart(2, "0")}</span><span className="redirect-checker__status">{result.status}</span><span className="redirect-checker__url" title={result.url}>{result.url}</span><button type="button" onClick={() => void copyUrl(index, result.url)}>{copied === index ? "Copied" : "Copy"}</button></li>)}
          </ol>
          <p className="redirect-checker__note">Requests are made from XXF&apos;s secure checker service so browser-specific redirect responses can be compared.</p>
        </div>
      ) : <div className="redirect-checker__empty">Enter a URL to see every redirect hop and the final response.</div>}
    </section>
  );
}
