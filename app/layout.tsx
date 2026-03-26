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
    default: "PDF Size Reducer | Compress PDF Online",
    template: "%s | PDF Size Reducer",
  },
  description:
    "Free online PDF compressor with HIGH, MIDIUM, and LOW modes. Upload, compress, and download optimized PDF files in seconds.",
  applicationName: "PDF Size Reducer",
  keywords: [
    "pdf size reducer",
    "compress pdf",
    "reduce pdf size",
    "online pdf compressor",
    "pdf optimizer",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "PDF Size Reducer | Compress PDF Online",
    description:
      "Upload, compress, and download PDFs with HIGH, MIDIUM, or LOW compression modes.",
    siteName: "PDF Size Reducer",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF Size Reducer | Compress PDF Online",
    description: "Free PDF compression tool with HIGH, MIDIUM, and LOW modes.",
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
