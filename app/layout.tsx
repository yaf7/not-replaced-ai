import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NotReplaced.ai — Will AI Take Your Job?",
  description: "Discover your career's AI threat level, learn which AI tools to master, and find the human skills that make you irreplaceable. Powered by Google Gemini.",
  keywords: ["AI", "career", "job replacement", "artificial intelligence", "future of work", "AI tools"],
  openGraph: {
    title: "NotReplaced.ai — Will AI Take Your Job?",
    description: "Discover your career's AI threat level and learn how to stay irreplaceable.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
