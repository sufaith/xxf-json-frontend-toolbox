import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/__debug"] }],
    sitemap: "https://www.xxf.app/sitemap.xml",
    host: "https://www.xxf.app",
  };
}
