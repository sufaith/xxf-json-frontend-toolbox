"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { OutputViewer, type JsonValue } from "@/components/OutputViewer";
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
  const [isMinified, setIsMinified] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [preserveEscapes, setPreserveEscapes] = useState(true);
  const [rainbowBrackets, setRainbowBrackets] = useState(true);
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(() => new Set());
  const [isOutputFullscreen, setIsOutputFullscreen] = useState(false);
  const outputPanelRef = useRef<HTMLDivElement>(null);

  const execute = useCallback(async () => {
    if (!input.trim()) {
      setOutput("");
      setMessage("Add input to start converting.");
      return;
    }
    try {
      const result = await runTool(tool.slug, input, { direction, indent });
      setOutput(result);
      setIsMinified(tool.slug === "json-minifier");
      setCollapsedPaths(new Set());
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

  useEffect(() => {
    const listener = () => setIsOutputFullscreen(document.fullscreenElement === outputPanelRef.current);
    document.addEventListener("fullscreenchange", listener);
    return () => document.removeEventListener("fullscreenchange", listener);
  }, []);

  const inputBytes = useMemo(() => new Blob([input]).size, [input]);
  const parsedOutput = useMemo(() => {
    if (!output.trim()) return { isJson: false, value: null as JsonValue | null };
    try {
      return { isJson: true, value: JSON.parse(output) as JsonValue };
    } catch {
      return { isJson: false, value: null as JsonValue | null };
    }
  }, [output]);
  const displayedOutput = useMemo(() => {
    if (!isMinified || !parsedOutput.isJson) return output;
    return JSON.stringify(parsedOutput.value);
  }, [isMinified, output, parsedOutput]);
  const outputBytes = useMemo(() => new Blob([displayedOutput]).size, [displayedOutput]);
  const canFold = parsedOutput.isJson && parsedOutput.value !== null && typeof parsedOutput.value === "object" && !isMinified;

  async function copyOutput() {
    if (!displayedOutput) return;
    await navigator.clipboard.writeText(displayedOutput);
    setMessage("Copied to clipboard.");
  }

  function downloadOutput() {
    if (!displayedOutput) return;
    const blob = new Blob([displayedOutput], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${tool.slug}.${tool.fileExtension}`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Download created.");
  }

  function toggleMinified() {
    if (!parsedOutput.isJson) return;
    setIsMinified((current) => !current);
    setCollapsedPaths(new Set());
    setMessage(isMinified ? "Formatted view restored." : "JSON compressed to one line.");
  }

  function collectContainerPaths(value: JsonValue, path = "$", paths: string[] = []) {
    if (value === null || typeof value !== "object") return paths;
    const entries = Array.isArray(value) ? value.map((item, index) => [String(index), item] as const) : Object.entries(value);
    if (!entries.length) return paths;
    paths.push(path);
    entries.forEach(([name, child]) => collectContainerPaths(child as JsonValue, `${path}/${encodeURIComponent(name)}`, paths));
    return paths;
  }

  function toggleAllObjects() {
    if (!canFold || parsedOutput.value === null) return;
    setCollapsedPaths((current) => current.size ? new Set() : new Set(collectContainerPaths(parsedOutput.value)));
  }

  function toggleObject(path: string) {
    setCollapsedPaths((current) => {
      const next = new Set(current);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement === outputPanelRef.current) await document.exitFullscreen();
      else await outputPanelRef.current?.requestFullscreen();
    } catch {
      setMessage("Fullscreen is not available in this browser.");
    }
  }

  return (
    <section className={`workbench ${compact ? "workbench--compact" : ""}`} aria-label={`${tool.name} workspace`}>
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

        <div className="editor-panel editor-panel--output" ref={outputPanelRef}>
          <div className="editor-panel__head">
            <span className="editor-panel__label">{tool.outputLabel}</span>
            <div className="editor-panel__head-tools">
              <div className="editor-panel__options">
                {tool.directions && (
                  <div className="segmented" aria-label="Conversion direction">
                    {tool.directions.map((label, index) => (
                      <button key={label} className={direction === index ? "is-active" : ""} onClick={() => setDirection(index)} type="button">{label}</button>
                    ))}
                  </div>
                )}
                {tool.slug.includes("json") && !tool.slug.includes("minifier") && tool.slug !== "json-validator" && (
                  <div className="segmented segmented--small" aria-label="Indentation">
                    {[2, 4].map((size) => (
                      <button key={size} className={indent === size ? "is-active" : ""} onClick={() => setIndent(size)} type="button">{size} spaces</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="editor-toolbar" role="toolbar" aria-label="Output actions">
                <button className="icon-button" type="button" aria-label="复制" data-tooltip="复制" onClick={() => void copyOutput()} disabled={!displayedOutput}><span aria-hidden="true">⧉</span></button>
                <button className={`icon-button ${isMinified ? "is-active" : ""}`} type="button" aria-label={isMinified ? "恢复格式化" : "压缩 JSON"} data-tooltip={isMinified ? "恢复格式化" : "压缩 JSON"} onClick={toggleMinified} disabled={!parsedOutput.isJson}><span aria-hidden="true">⇥</span></button>
                <button className="icon-button" type="button" aria-label="下载" data-tooltip="下载" onClick={downloadOutput} disabled={!displayedOutput}><span aria-hidden="true">⇩</span></button>
                <span className="editor-toolbar__separator" aria-hidden="true" />
                <button className={`icon-button ${showLineNumbers ? "is-active" : ""}`} type="button" aria-label={showLineNumbers ? "隐藏行号" : "显示行号"} data-tooltip={showLineNumbers ? "隐藏行号" : "显示行号"} onClick={() => setShowLineNumbers((current) => !current)}><span aria-hidden="true">#</span></button>
                <button className={`icon-button ${collapsedPaths.size ? "is-active" : ""}`} type="button" aria-label={collapsedPaths.size ? "展开全部对象" : "折叠全部对象"} data-tooltip={collapsedPaths.size ? "展开全部对象" : "折叠全部对象"} onClick={toggleAllObjects} disabled={!canFold}><span aria-hidden="true">{collapsedPaths.size ? "⊞" : "⊟"}</span></button>
                <button className={`icon-button ${preserveEscapes ? "is-active" : ""}`} type="button" aria-label={preserveEscapes ? "可读显示转义符" : "保留转义符显示"} data-tooltip={preserveEscapes ? "可读显示转义符" : "保留转义符显示"} onClick={() => setPreserveEscapes((current) => !current)} disabled={!parsedOutput.isJson}><span aria-hidden="true">\</span></button>
                <button className={`icon-button icon-button--rainbow ${rainbowBrackets ? "is-active" : ""}`} type="button" aria-label={rainbowBrackets ? "关闭彩虹括号" : "开启彩虹括号"} data-tooltip={rainbowBrackets ? "关闭彩虹括号" : "开启彩虹括号"} onClick={() => setRainbowBrackets((current) => !current)} disabled={!parsedOutput.isJson || isMinified}><span aria-hidden="true">{`{}`}</span></button>
                <button className={`icon-button ${isOutputFullscreen ? "is-active" : ""}`} type="button" aria-label={isOutputFullscreen ? "退出全屏" : "全屏"} data-tooltip={isOutputFullscreen ? "退出全屏" : "全屏"} onClick={() => void toggleFullscreen()}><span aria-hidden="true">⛶</span></button>
              </div>
              <span className="editor-panel__stats">{displayedOutput.length.toLocaleString()} chars · {outputBytes.toLocaleString()} B</span>
            </div>
          </div>
          <OutputViewer
            output={displayedOutput}
            jsonValue={parsedOutput.value}
            isJson={parsedOutput.isJson}
            isMinified={isMinified}
            indentSize={indent}
            showLineNumbers={showLineNumbers}
            preserveEscapes={preserveEscapes}
            rainbowBrackets={rainbowBrackets}
            collapsedPaths={collapsedPaths}
            onTogglePath={toggleObject}
          />
        </div>
      </div>

      <div id={`status-${tool.slug}`} className="sr-only" role="status" aria-live="polite">{message}</div>
    </section>
  );
}
