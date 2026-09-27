import type { MetadataRoute } from "next";
import { guides } from "@/lib/guides";
import { tools } from "@/lib/tools";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-09-02T00:00:00.000Z");
  return [
    { url: "https://xxf.app/", lastModified, changeFrequency: "weekly", priority: 1 },
    { url: "https://xxf.app/guides/", lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: "https://xxf.app/animal/", lastModified, changeFrequency: "monthly", priority: 0.82 },
    ...tools.map((tool) => ({ url: `https://xxf.app/tools/${tool.slug}/`, lastModified, changeFrequency: "monthly" as const, priority: 0.85 })),
    ...guides.map((guide) => ({ url: `https://xxf.app/guides/${guide.slug}/`, lastModified, changeFrequency: "monthly" as const, priority: 0.72 })),
    { url: "https://xxf.app/site-map/", lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: "https://xxf.app/editorial-policy/", lastModified, changeFrequency: "monthly", priority: 0.55 },
    ...["about", "contact", "privacy", "terms"].map((page) => ({ url: `https://xxf.app/${page}/`, lastModified, changeFrequency: "yearly" as const, priority: 0.35 })),
  ];
}
