"use client";

import { useMemo, useState } from "react";
import { toolMap } from "@/lib/tools";

type QueryTableProps = { params: Array<[string, string]>; depth?: number };

function nestedParams(value: string) {
  try {
    const nested = new URL(value);
    return nested.searchParams.size > 0 ? Array.from(nested.searchParams.entries()) : null;
  } catch {
    return null;
  }
}

function QueryTable({ params, depth = 0 }: QueryTableProps) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  async function copyValue(index: number, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(index);
      window.setTimeout(() => setCopied((current) => current === index ? null : current), 1600);
    } catch {
      setCopied(null);
    }
  }

  return (
    <div className={`url-parser-table ${depth ? "url-parser-table--nested" : ""}`}>
      <div className="url-parser-table__head"><span>Key</span><span>Value</span><span aria-hidden="true" /></div>
      {params.map(([key, value], index) => {
        const nested = depth < 3 ? nestedParams(value) : null;
        const isExpanded = expanded === index;
        return (
          <div className="url-parser-table__row-group" key={`${key}-${index}`}>
            <div className="url-parser-table__row">
              <button
                className={`url-parser-table__key ${nested ? "is-expandable" : ""} ${isExpanded ? "is-expanded" : ""}`}
                type="button"
                onClick={() => nested && setExpanded(isExpanded ? null : index)}
                disabled={!nested}
                aria-expanded={nested ? isExpanded : undefined}
              >
                {nested ? <span aria-hidden="true">{isExpanded ? "⌄" : "›"}</span> : null}{key}
              </button>
              <span className="url-parser-table__value" title={value}>{value}</span>
              <button className="url-parser-table__copy" type="button" onClick={() => void copyValue(index, value)}>{copied === index ? "Copied" : "Copy"}</button>
            </div>
            {nested && isExpanded ? <div className="url-parser-table__nested"><QueryTable params={nested} depth={depth + 1} /></div> : null}
          </div>
        );
      })}
    </div>
  );
}

export function UrlParserWorkbench() {
  const tool = toolMap.get("url-parser");
  const [input, setInput] = useState(tool?.sample ?? "");
  const parsed = useMemo(() => {
    if (!input.trim()) return { url: null, error: "Paste a URL to inspect it." };
    try {
      return { url: new URL(input.trim()), error: "" };
    } catch {
      return { url: null, error: "Enter a complete URL, including https:// or http://." };
    }
  }, [input]);

  const details = parsed.url ? [
    ["Protocol", parsed.url.protocol],
    ["Origin", parsed.url.origin],
    ["Host", parsed.url.host],
    ["Path", parsed.url.pathname],
    ["Hash", parsed.url.hash || "—"],
  ] : [];
  const params = parsed.url ? Array.from(parsed.url.searchParams.entries()) : [];

  return (
    <section className="utility-workbench utility-workbench--url-parser" aria-label="URL Parser workspace">
      <header className="utility-workbench__hero">
        <div><span className="utility-workbench__eyebrow">Encoding · Inspect query params</span><h1>URL Parser</h1><p>Parse a URL into its components and explore nested query parameters.</p></div>
        <div className="utility-workbench__hero-actions"><button type="button" className="ghost-button" onClick={() => setInput(tool?.sample ?? "")}>Use sample</button><button type="button" className="ghost-button" onClick={() => setInput("")}>Clear</button></div>
      </header>
      <div className="utility-workbench__grid">
        <div className="utility-workbench__input panel-surface">
          <label htmlFor="url-parser-input">URL to parse</label>
          <textarea id="url-parser-input" value={input} onChange={(event) => setInput(event.target.value)} spellCheck={false} placeholder="Paste a URL to inspect..." />
          <div className="utility-workbench__hint">Runs locally in your browser · query values can be expanded</div>
        </div>
        <div className="utility-workbench__output panel-surface">
          <div className="utility-workbench__output-head"><span>URL details</span>{parsed.url ? <small>{params.length} query {params.length === 1 ? "parameter" : "parameters"}</small> : null}</div>
          {parsed.error ? <p className="utility-workbench__empty" role="status">{parsed.error}</p> : (
            <>
              <div className="url-parser-details">{details.map(([label, value]) => <div key={label}><span>{label}</span><b title={value}>{value}</b></div>)}</div>
              {params.length ? <QueryTable params={params} /> : <p className="utility-workbench__empty">This URL has no query parameters.</p>}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
