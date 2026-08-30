"use client";

import Link from "next/link";
import { useState } from "react";
import { categories, tools, type ToolCategory } from "@/lib/tools";

export function ToolExplorer() {
  const [category, setCategory] = useState<ToolCategory | "All">("All");
  const filtered = category === "All" ? tools : tools.filter((tool) => tool.category === category);

  return (
    <div className="tool-explorer">
      <div className="tool-explorer__bar">
        <div className="category-tabs" aria-label="Tool categories">
          {(["All", ...categories] as const).map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setCategory(item)}
              className={category === item ? "is-active" : ""}
              aria-pressed={category === item}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <Link href="/animal/" className="museum-feature">
        <span className="museum-feature__mark" aria-hidden="true">✦</span>
        <span className="museum-feature__copy"><small>NEW DESTINATION</small><strong>Prehistoric Animal Museum</strong><em>18 interactive specimens · English / 中文</em></span>
        <span className="museum-feature__arrow" aria-hidden="true">↗</span>
      </Link>
      <div className="tool-card-grid">
        {filtered.map((tool, index) => (
          <Link
            href={`/tools/${tool.slug}/`}
            className={`tool-card tool-card--${tool.category.toLowerCase()}`}
            key={tool.slug}
          >
            <div className="tool-card__top">
              <span className="tool-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="tool-category">{tool.category}</span>
            </div>
            <h3>{tool.name}</h3>
            <p>{tool.description}</p>
            <span className="tool-card__open" aria-hidden="true">↗</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
