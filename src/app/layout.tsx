import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Takovic — AI-Powered Financial Analysis",
  description:
    "Smart stock analysis, visual fundamentals, and AI-powered insights. Your all-in-one financial research platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
