import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Estiuk Arafat Arnob — AI & Data Science",
  description:
    "Portfolio of Estiuk Arafat Arnob, AI enthusiast, ML engineer, data scientist, and XAI researcher.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/img/profile.jpg",
    shortcut: "/img/profile.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
