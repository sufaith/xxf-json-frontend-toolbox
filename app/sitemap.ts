import type { MetadataRoute } from "next";
import { guides } from "@/lib/guides";
import { tools } from "@/lib/tools";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-08-02T00:00:00.000Z");
  return [
    { url: "https://www.xxf.app/", lastModified, changeFrequency: "weekly", priority: 1 },
    ...tools.map((tool) => ({ url: `https://www.xxf.app/tools/${tool.slug}/`, lastModified, changeFrequency: "monthly" as const, priority: 0.85 })),
    ...guides.map((guide) => ({ url: `https://www.xxf.app/guides/${guide.slug}/`, lastModified, changeFrequency: "monthly" as const, priority: 0.72 })),
    ...["about", "privacy", "terms"].map((page) => ({ url: `https://www.xxf.app/${page}/`, lastModified, changeFrequency: "yearly" as const, priority: 0.35 })),
  ];
}
