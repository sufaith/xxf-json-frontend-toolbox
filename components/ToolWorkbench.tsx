"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { runTool } from "@/lib/transformers";
import { toolMap, tools } from "@/lib/tools";

type Props = {
  initialSlug: string;
  compact?: boolean;
};

export function ToolWorkbench({ initialSlug, compact = false }: Props) {
  const tool = toolMap.get(initialSlug) ?? tools[0];
  const [input, setInput] = useState(tool.sample);
  const [output, setOutput] = useState("");
  const [direction, setDirection] = useState(0);
  const [indent, setIndent] = useState(2);
  const [mobilePanel, setMobilePanel] = useState<"input" | "output">("input");
  const [message, setMessage] = useState("Ready — your data stays in this tab.");

  const execute = useCallback(async () => {
    if (!input.trim()) {
      setOutput("");
      setMessage("Add input to start converting.");
      return;
    }
    try {
      const result = await runTool(tool.slug, input, { direction, indent });
      setOutput(result);
      setMessage("Converted locally — nothing was uploaded.");
    } catch (error) {
      setOutput("");
      setMessage(error instanceof Error ? error.message : "Conversion failed.");
    }
  }, [direction, indent, input, tool.slug]);

  useEffect(() => {
    const timer = window.setTimeout(() => void execute(), 220);
    return () => window.clearTimeout(timer);
  }, [execute]);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        void execute();
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [execute]);

  const inputBytes = useMemo(() => new Blob([input]).size, [input]);
  const outputBytes = useMemo(() => new Blob([output]).size, [output]);

  async function copyOutput() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setMessage("Copied to clipboard.");
  }

  function downloadOutput() {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${tool.slug}.${tool.fileExtension}`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Download created.");
  }

  function selectTool(slug: string) {
    window.location.href = `/tools/${slug}/`;
  }

  return (
    <section className={`workbench ${compact ? "workbench--compact" : ""}`} aria-label={`${tool.name} workspace`}>
      <div className="workbench__controls">
        <label className="tool-select-label">
          <span>Switch tool</span>
          <select value={tool.slug} onChange={(event) => selectTool(event.target.value)} aria-label="Switch tool">
            {tools.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
          </select>
        </label>

        {tool.directions && (
          <div className="segmented" aria-label="Conversion direction">
            {tool.directions.map((label, index) => (
              <button key={label} className={direction === index ? "is-active" : ""} onClick={() => setDirection(index)} type="button">
                {label}
              </button>
            ))}
          </div>
        )}

        {tool.slug.includes("json") && !tool.slug.includes("minifier") && tool.slug !== "json-validator" && (
          <div className="segmented segmented--small" aria-label="Indentation">
            {[2, 4].map((size) => (
              <button key={size} className={indent === size ? "is-active" : ""} onClick={() => setIndent(size)} type="button">
                {size} spaces
              </button>
            ))}
          </div>
        )}

        {compact && <Link className="text-link" href={`/tools/${tool.slug}/`}>Open full tool ↗</Link>}
      </div>

      <div className="mobile-editor-tabs" aria-label="Editor panel">
        <button type="button" className={mobilePanel === "input" ? "is-active" : ""} aria-pressed={mobilePanel === "input"} onClick={() => setMobilePanel("input")}>Input</button>
        <button type="button" className={mobilePanel === "output" ? "is-active" : ""} aria-pressed={mobilePanel === "output"} onClick={() => setMobilePanel("output")}>Output {output ? <span>●</span> : null}</button>
      </div>

      <div className={`editor-grid editor-grid--mobile-${mobilePanel}`}>
        <div className="editor-panel">
          <div className="editor-panel__head">
            <label htmlFor={`input-${tool.slug}`}>{tool.inputLabel}</label>
            <div className="editor-panel__head-tools">
              <div className="editor-panel__actions">
                <button className="ghost-button" type="button" onClick={() => setInput(tool.sample)}>Use sample</button>
                <button className="ghost-button" type="button" onClick={() => setInput("")}>Clear</button>
                {tool.reverseSlug && <Link className="ghost-button" href={`/tools/${tool.reverseSlug}/`}>Reverse tool ↔</Link>}
              </div>
              <span className="editor-panel__stats">{input.length.toLocaleString()} chars · {inputBytes.toLocaleString()} B</span>
            </div>
          </div>
          <textarea
            id={`input-${tool.slug}`}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
            aria-describedby={`status-${tool.slug}`}
          />
        </div>

        <div className="editor-panel editor-panel--output">
          <div className="editor-panel__head">
            <label htmlFor={`output-${tool.slug}`}>{tool.outputLabel}</label>
            <div className="editor-panel__head-tools">
              <div className="editor-panel__actions">
                <button className="ghost-button" type="button" onClick={() => void copyOutput()} disabled={!output}>Copy</button>
                <button className="ghost-button" type="button" onClick={downloadOutput} disabled={!output}>Download</button>
              </div>
              <span className="editor-panel__stats">{output.length.toLocaleString()} chars · {outputBytes.toLocaleString()} B</span>
            </div>
          </div>
          <textarea id={`output-${tool.slug}`} value={output} readOnly spellCheck={false} placeholder="Your result appears here…" />
        </div>
      </div>

      <div id={`status-${tool.slug}`} className="sr-only" role="status" aria-live="polite">{message}</div>
    </section>
  );
}
