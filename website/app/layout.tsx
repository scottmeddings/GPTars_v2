import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og-project-summary-v2.png`;

  return {
    title: "GP-TARS V2 — 1 Metre Walking Robot",
    description: "Engineering specifications, Fusion drawings, closed-loop walking, ROS 2 control and local AI architecture for the one-metre autonomous GP-TARS V2 robot.",
    openGraph: {
      title: "GP-TARS V2 — Autonomous walking TARS",
      description: "An all-metal one-metre robot with closed-loop walking, ROS 2 control, vision, speech and local AI.",
      type: "website",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: "GP-TARS V2 autonomous walking robot engineering concept" }],
    },
    twitter: { card: "summary_large_image", images: [imageUrl] },
  };
}

// Applied before first paint so the sheet never flashes the wrong theme. The
// GitHub Pages export strips all scripts and re-attaches static/theme.js
// instead, which reads the same storage key.
const THEME_INIT = `(()=>{try{const s=localStorage.getItem("gptars-theme");
document.documentElement.dataset.theme=s??(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light")}catch(e){
document.documentElement.dataset.theme="light"}})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
