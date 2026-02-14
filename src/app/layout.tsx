import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { SessionRefresher } from "@/components/SessionRefresher";
import PreloadImages from "@/components/homepage/PreloadImages";

export const metadata: Metadata = {
  title: "Intimate - Premium Intimate Apparel",
  description: "Discover our handcrafted intimate apparel collection. Intimate makes pieces that are playful, pretty, and totally extra — for days when you wanna shine like you mean it.",
  keywords: "lingerie, bras, panties, sleepwear, shapewear, intimate apparel, fashion, intimate",
  openGraph: {
    title: "Intimate - Premium Intimate Apparel",
    description: "Discover our handcrafted intimate apparel collection.",
    type: "website",
    locale: "en_IN",
    siteName: "Intimate",
  },
};

import { Audiowide, Montserrat, Inter } from 'next/font/google';

const audiowide = Audiowide({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-audiowide'
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-montserrat'
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-manrope'
});

import localFont from 'next/font/local';

// Exact font from rhodeskin.com - NNRektorat Web Heavy
const rhode = localFont({
  src: './fonts/NNRektoratWeb-Heavy.woff2',
  variable: '--font-rhode',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical homepage images for instant reload */}
        <Suspense fallback={null}>
          <PreloadImages />
        </Suspense>
      </head>
      <body className={`antialiased ${audiowide.variable} ${montserrat.variable} ${inter.variable} ${rhode.variable} font-sans`}>
        <Suspense fallback={null}>
          <SessionRefresher />
        </Suspense>
        <CartProvider>
          <Suspense fallback={null}>
            <SiteHeader />
          </Suspense>
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
