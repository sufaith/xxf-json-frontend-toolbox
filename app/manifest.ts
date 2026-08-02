import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "XXF JSON & Frontend Tools",
    short_name: "XXF Tools",
    description: "Private browser-based JSON and frontend conversion tools.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f5ef",
    theme_color: "#c8ff4d",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
