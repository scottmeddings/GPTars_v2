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

// The sheet is dark by default. The markup ships with data-theme="dark" so the
// first paint, and the scriptless GitHub Pages export, are dark without any
// JavaScript. This only switches to light if the reader has explicitly chosen
// it, which is why the system colour scheme is deliberately not consulted.
const THEME_INIT = `(()=>{try{if(localStorage.getItem("gptars-theme")==="light")
document.documentElement.dataset.theme="light"}catch(e){}})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <meta name="color-scheme" content="dark light" />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
