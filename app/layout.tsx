import type { Metadata, Viewport } from "next";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://xxf.app"),
  title: { default: "XXF Tools — JSON, Frontend, Image & Video Tools", template: "%s | XXF Tools" },
  description: "Private, fast JSON, frontend, image and video tools with browser-local conversion and playback.",
  applicationName: "XXF Tools",
  category: "technology",
  keywords: ["JSON tools", "frontend tools", "image tools", "video tools", "M3U8 player", "M3U8 converter", "HLS player", "video to HLS", "developer tools", "URL parser", "redirect checker", "JSON converter", "image compressor", "photo collage maker"],
  authors: [{ name: "XXF Tools editorial team", url: "https://xxf.app/about/" }],
  creator: "XXF Tools",
  publisher: "XXF Tools",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://xxf.app/",
    siteName: "XXF Tools",
    title: "XXF Tools — JSON in. Frontend-ready out.",
  description: "30 private browser-based tools for JSON, frontend data, images, video and developer workflows.",
    images: [{ url: "/og.jpg", width: 1536, height: 1024, alt: "XXF JSON and frontend conversion toolbox" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "XXF Tools — JSON in. Frontend-ready out.",
    description: "30 private browser-based JSON, frontend, image and video tools.",
    images: ["/og.jpg"],
  },
  icons: { icon: "/favicon.ico", apple: "/icon-192.png" },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#c8ff4d" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5078282844971985"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
