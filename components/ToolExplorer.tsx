"use client";

import Link from "next/link";
import { useState } from "react";
import { categories, tools, type ToolCategory } from "@/lib/tools";

const featuredToolSlugs = ["json-formatter", "image-compressor", "m3u8-player", "video-to-m3u8"] as const;

export function ToolExplorer() {
  const [category, setCategory] = useState<ToolCategory | "All">("All");
  const featuredTools = tools.filter((tool) => featuredToolSlugs.includes(tool.slug as (typeof featuredToolSlugs)[number]));
  const filtered = category === "All"
    ? tools.filter((tool) => !featuredToolSlugs.includes(tool.slug as (typeof featuredToolSlugs)[number]))
    : tools.filter((tool) => tool.category === category);

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
      {category === "All" && (
        <section className="featured-tools" aria-labelledby="featured-tools-title">
          <div className="featured-tools__heading">
            <div>
              <span>Start here</span>
              <h2 id="featured-tools-title">Most-used tools</h2>
            </div>
            <p>Four direct paths for formatting data, compressing images and working with HLS video.</p>
          </div>
          <div className="featured-tool-grid">
            {featuredTools.map((tool, index) => (
              <Link
                href={`/tools/${tool.slug}/`}
                className={`featured-tool-card tool-card--${tool.category.toLowerCase()}`}
                key={tool.slug}
              >
                <div className="featured-tool-card__top">
                  <span className="featured-tool-card__number">0{index + 1}</span>
                  <span className="tool-category">{tool.category}</span>
                </div>
                <span className="featured-tool-card__eyebrow">{tool.eyebrow}</span>
                <h3>{tool.name}</h3>
                <p>{tool.description}</p>
                <span className="featured-tool-card__open" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </section>
      )}
      <div className="tool-card-grid">
        {filtered.map((tool, index) => (
          <Link
            href={`/tools/${tool.slug}/`}
            className={`tool-card tool-card--${tool.category.toLowerCase()}`}
            key={tool.slug}
          >
            <div className="tool-card__top">
              <span className="tool-number">{String(index + (category === "All" ? 5 : 1)).padStart(2, "0")}</span>
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
