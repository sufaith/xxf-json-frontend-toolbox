import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.XXF_STATIC_EXPORT === "1" ? { output: "export" as const } : {}),
  trailingSlash: true,
  poweredByHeader: false,
  turbopack: { root: process.cwd() },
};

export default nextConfig;
