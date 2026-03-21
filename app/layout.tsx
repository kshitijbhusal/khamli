// app/layout.tsx
import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";

import Script from 'next/script';
import AdBanner from "@/components/AdBanner";


// const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
// const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Khamli — Share Anything, No Signup",
  description: "Send files, links, and messages using a 4-character code. No account, no login, no trace. Everything wipes in 10 minutes.",
  // Add this section:
  icons: {
    icon: "/image.png",
    apple: "/image.png", // Recommended for iOS home screen icons
  },
  openGraph: {
    title: "Khamli — Share Anything, No Signup",
    description: "Share anonymously. Self-destructs in 10 minutes.",
    url: "https://khamli.com",
    siteName: "Khamli",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">

      <head>


      </head>


      <body
        // className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
        className={`antialiased min-h-screen`}
        style={{ background: "var(--bg)", color: "var(--text-primary)" }}
      >


        {/* Adsense Script */}
        <Script
          async
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5837969877814739"
          crossOrigin="anonymous"
        />

        <ThemeProvider>
          <Navbar />
          <AdBanner/>
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
