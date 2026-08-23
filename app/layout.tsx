import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import "./globals.css";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.xxf.app"),
  title: { default: "XXF Tools — JSON, Frontend & Image Tools", template: "%s | XXF Tools" },
  description: "Private, fast JSON, frontend and image tools that run entirely in your browser.",
  applicationName: "XXF Tools",
  category: "technology",
  keywords: ["JSON tools", "frontend tools", "image tools", "developer tools", "JSON converter", "photo collage maker"],
  authors: [{ name: "XXF Tools", url: "https://www.xxf.app/about/" }],
  creator: "XXF Tools",
  publisher: "XXF Tools",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.xxf.app/",
    siteName: "XXF Tools",
    title: "XXF Tools — JSON in. Frontend-ready out.",
    description: "25 private browser-based tools for JSON, frontend data, images and developer workflows.",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "XXF JSON and frontend conversion toolbox" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "XXF Tools — JSON in. Frontend-ready out.",
    description: "25 private browser-based JSON, frontend and image tools.",
    images: ["/og.png"],
  },
  icons: { icon: "/favicon.ico", apple: "/icon-192.png" },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#c8ff4d" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5078282844971985"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
