import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";


import { LanguageProvider } from "@/components/language-provider";
import { ScrollToTop } from "@/components/scroll-to-top";
import { ReduxProvider } from "@/components/redux-provider";

export const metadata: Metadata = {
  title: "Asal MG - Connecting Culures, Through Media",
  description:
    "Unified corporate website for Asal Media Group connecting Asal TV, Jiil Media, Masrax Production, and Nasiye platform.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <LanguageProvider>
            <main className="min-h-screen">{children}</main>
            <ScrollToTop />
          </LanguageProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
