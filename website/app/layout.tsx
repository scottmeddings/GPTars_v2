import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og.png`;

  return {
    title: "GP-TARS V2 — 1 Metre Walking Robot",
    description: "Engineering specifications, Fusion drawings, ROS 2 software and local AI architecture for the full-scale aluminium GP-TARS V2 robot.",
    openGraph: {
      title: "GP-TARS V2 — Full-scale aluminium TARS",
      description: "Mechanical architecture, Fusion drawings, ROS 2 control and onboard LLM compute for a one-metre walking robot.",
      type: "website",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: "GP-TARS V2 aluminium robot engineering concept" }],
    },
    twitter: { card: "summary_large_image", images: [imageUrl] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
