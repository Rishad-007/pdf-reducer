import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://pdf-size-reducer.vercel.app";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Rishad's PDF Reducer | Free Online PDF Size Reducer",
    template: "%s | Rishad's PDF Reducer",
  },
  description:
    "Rishad's PDF Reducer is a free online PDF compressor where you can upload, reduce PDF file size, and download optimized files in seconds.",
  applicationName: "Rishad's PDF Reducer",
  keywords: [
    "rishad pdf reducer",
    "pdf size reducer",
    "free pdf reducer",
    "compress pdf",
    "reduce pdf size",
    "reduce file size online",
    "online pdf compressor",
    "pdf optimizer",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "Rishad's PDF Reducer | Free Online PDF Size Reducer",
    description:
      "Freely upload and compress PDF files with high, medium, or low compression modes and instant download.",
    siteName: "Rishad's PDF Reducer",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rishad's PDF Reducer | Free Online PDF Compressor",
    description:
      "Upload your PDF, reduce file size, and download an optimized PDF instantly.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "productivity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
