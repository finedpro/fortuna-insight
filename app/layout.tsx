import type { Metadata } from "next";
import "@fontsource-variable/syne";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import { SITE_CONFIG } from "@/lib/constants";
import { getSiteUrl } from "@/lib/share/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: SITE_CONFIG.name,
  description: SITE_CONFIG.description,
  openGraph: { title: SITE_CONFIG.name, description: SITE_CONFIG.description, type: "website", siteName: SITE_CONFIG.name },
  twitter: { card: "summary_large_image", title: SITE_CONFIG.name, description: SITE_CONFIG.description },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans">{children}</body>
    </html>
  );
}
