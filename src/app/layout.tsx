import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Youth Sports Tracker",

  description:
    "Track live youth baseball stats and share game updates instantly with family & friends.",

  manifest: "/manifest.json",

  icons: {
    icon: "/favicon.ico",

    apple: "/icons/apple-touch-icon.png",
  },

  themeColor: "#2563eb",

  openGraph: {
    title: "Youth Sports Tracker",

    description:
      "Track live youth baseball stats and share game updates instantly.",

    url: "https://youthsportstracker.com",

    siteName: "Youth Sports Tracker",

    images: [
      {
        url: "/images/baseball-kids.png",
        width: 1200,
        height: 630,
      },
    ],

    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta
          name="apple-mobile-web-app-capable"
          content="yes"
        />

        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black"
        />
      </head>

      <body className="min-h-full flex flex-col">
        {children}

        <Analytics />

        {/* Google Ads Tag */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-18183051018"
        />

        <Script id="google-ads">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'AW-18183051018');
          `}
        </Script>
      </body>
    </html>
  );
}