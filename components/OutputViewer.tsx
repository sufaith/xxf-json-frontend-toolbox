"use client";

import type { CSSProperties, ReactNode } from "react";

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

type Props = {
  output: string;
  jsonValue: JsonValue | null;
  isJson: boolean;
  isMinified: boolean;
  indentSize: number;
  showLineNumbers: boolean;
  encodeEscapes: boolean;
  rainbowBrackets: boolean;
  collapsedPaths: Set<string>;
  onTogglePath: (path: string) => void;
};

type LineProps = {
  depth: number;
  children: ReactNode;
};

function OutputLine({ depth, children }: LineProps) {
  return <div className="code-output-line" style={{ "--json-depth": depth } as CSSProperties}>{children}</div>;
}

function isContainer(value: JsonValue): value is JsonValue[] | { [key: string]: JsonValue } {
  return value !== null && typeof value === "object";
}

function bracket(value: string, depth: number, rainbow: boolean) {
  return <span className={rainbow ? `json-bracket json-bracket--${depth % 6}` : "json-bracket"}>{value}</span>;
}

function displayString(value: string, encodeEscapes: boolean) {
  const escaped = JSON.stringify(value);
  if (!encodeEscapes) return escaped;
  return escaped
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

function primitive(value: Exclude<JsonValue, JsonValue[] | { [key: string]: JsonValue }>, encodeEscapes: boolean) {
  if (typeof value === "string") return <span className="json-string">{displayString(value, encodeEscapes)}</span>;
  if (typeof value === "number") return <span className="json-number">{String(value)}</span>;
  if (typeof value === "boolean") return <span className="json-boolean">{String(value)}</span>;
  return <span className="json-null">null</span>;
}

function keyPrefix(name: string | undefined, encodeEscapes: boolean) {
  if (name === undefined) return null;
  return <><span className="json-key">{displayString(name, encodeEscapes)}</span><span className="json-punctuation">: </span></>;
}

function foldControl(path: string, collapsed: boolean, kind: "object" | "array", onTogglePath: (path: string) => void) {
  const action = collapsed ? "展开" : "折叠";
  return (
    <button
      className="json-fold-toggle"
      type="button"
      aria-label={`${action}${kind === "array" ? "数组" : "对象"}`}
      data-tooltip={`${action}${kind === "array" ? "数组" : "对象"}`}
      onClick={() => onTogglePath(path)}
    >
      {collapsed ? "▸" : "▾"}
    </button>
  );
}

function renderJsonLines(
  value: JsonValue,
  depth: number,
  path: string,
  name: string | undefined,
  trailingComma: boolean,
  encodeEscapes: boolean,
  rainbowBrackets: boolean,
  collapsedPaths: Set<string>,
  onTogglePath: (path: string) => void,
): ReactNode[] {
  const comma = trailingComma ? <span className="json-punctuation">,</span> : null;
  if (!isContainer(value)) {
    return [<OutputLine depth={depth} key={path}><span className="json-fold-spacer" />{keyPrefix(name, encodeEscapes)}{primitive(value, encodeEscapes)}{comma}</OutputLine>];
  }

  const isArray = Array.isArray(value);
  const entries: Array<[string, JsonValue]> = isArray
    ? value.map((item, index) => [String(index), item])
    : Object.entries(value);
  const open = isArray ? "[" : "{";
  const close = isArray ? "]" : "}";
  const kind = isArray ? "array" : "object";
  const collapsed = collapsedPaths.has(path);

  if (!entries.length) {
    return [<OutputLine depth={depth} key={path}><span className="json-fold-spacer" />{keyPrefix(name, encodeEscapes)}{bracket(open, depth, rainbowBrackets)}{bracket(close, depth, rainbowBrackets)}{comma}</OutputLine>];
  }

  if (collapsed) {
    return [
      <OutputLine depth={depth} key={path}>
        {foldControl(path, true, kind, onTogglePath)}
        {keyPrefix(name, encodeEscapes)}
        {bracket(open, depth, rainbowBrackets)}
        <span className="json-collapsed">… {entries.length} {entries.length === 1 ? "item" : "items"}</span>
        {bracket(close, depth, rainbowBrackets)}
        {comma}
      </OutputLine>,
    ];
  }

  const lines: ReactNode[] = [
    <OutputLine depth={depth} key={`${path}:open`}>
      {foldControl(path, false, kind, onTogglePath)}
      {keyPrefix(name, encodeEscapes)}
      {bracket(open, depth, rainbowBrackets)}
    </OutputLine>,
  ];
  entries.forEach(([entryName, entryValue], index) => {
    const childPath = `${path}/${encodeURIComponent(entryName)}`;
    lines.push(...renderJsonLines(
      entryValue,
      depth + 1,
      childPath,
      isArray ? undefined : entryName,
      index < entries.length - 1,
      encodeEscapes,
      rainbowBrackets,
      collapsedPaths,
      onTogglePath,
    ));
  });
  lines.push(<OutputLine depth={depth} key={`${path}:close`}><span className="json-fold-spacer" />{bracket(close, depth, rainbowBrackets)}{comma}</OutputLine>);
  return lines;
}

function PlainOutput({ output }: { output: string }) {
  const lines = output ? output.split("\n") : ["Your result appears here…"];
  return <>{lines.map((line, index) => <OutputLine depth={0} key={`${index}:${line}`}><span className={output ? "plain-output-text" : "plain-output-placeholder"}>{line || " "}</span></OutputLine>)}</>;
}

export function OutputViewer({
  output,
  jsonValue,
  isJson,
  isMinified,
  indentSize,
  showLineNumbers,
  encodeEscapes,
  rainbowBrackets,
  collapsedPaths,
  onTogglePath,
}: Props) {
  return (
    <div
      className={`output-viewer ${showLineNumbers ? "output-viewer--line-numbers" : ""}`}
      style={{ "--json-indent": `${indentSize}ch` } as CSSProperties}
      tabIndex={0}
      aria-label="Generated output"
    >
      {isJson && !isMinified
        ? renderJsonLines(jsonValue, 0, "$", undefined, false, encodeEscapes, rainbowBrackets, collapsedPaths, onTogglePath)
        : <PlainOutput output={output} />}
    </div>
  );
}

export type { JsonValue };
