import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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

icons: {
icon: "/favicon.ico",
},

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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
