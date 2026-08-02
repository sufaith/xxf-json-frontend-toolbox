"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { categories, tools, type ToolCategory } from "@/lib/tools";

export function ToolExplorer() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ToolCategory | "All">("All");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return tools.filter((tool) => {
      const matchesCategory = category === "All" || tool.category === category;
      const matchesQuery = !normalized || `${tool.name} ${tool.description} ${tool.keywords.join(" ")}`.toLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <div className="tool-explorer">
      <div className="tool-explorer__bar">
        <label className="search-box">
          <span aria-hidden="true">⌕</span>
          <span className="sr-only">Search tools</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search JSON, YAML, JWT, Base64…" />
          <kbd>/</kbd>
        </label>
        <div className="category-tabs" aria-label="Tool categories">
          {(["All", ...categories] as const).map((item) => (
            <button type="button" key={item} onClick={() => setCategory(item)} className={category === item ? "is-active" : ""}>{item}</button>
          ))}
        </div>
      </div>
      <div className="tool-card-grid">
        {filtered.map((tool, index) => (
          <Link href={`/tools/${tool.slug}/`} className="tool-card" key={tool.slug}>
            <div className="tool-card__top">
              <span className="tool-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="tool-category">{tool.category}</span>
            </div>
            <h3>{tool.name}</h3>
            <p>{tool.description}</p>
            <span className="tool-card__open">Open tool <b>↗</b></span>
          </Link>
        ))}
      </div>
      {!filtered.length && <p className="empty-state">No matching tool yet. Try a broader search.</p>}
    </div>
  );
}
