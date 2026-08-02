import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/__debug"] }],
    sitemap: "https://xxf.app/sitemap.xml",
    host: "https://xxf.app",
  };
}
