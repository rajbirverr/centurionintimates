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

import { Playfair_Display, Lato, Audiowide, Montserrat, Manrope } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair'
});

const lato = Lato({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-lato'
});

const audiowide = Audiowide({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-audiowide'
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['900'],
  style: ['italic'],
  variable: '--font-montserrat'
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope'
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="https://ext.same-assets.com/2896541614/344479640.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Preload critical homepage images for instant reload */}
        <Suspense fallback={null}>
          <PreloadImages />
        </Suspense>
      </head>
      <body className={`antialiased ${playfair.variable} ${lato.variable} ${audiowide.variable} ${montserrat.variable} ${manrope.variable} font-sans`}>
        <Suspense fallback={null}>
          <SessionRefresher />
        </Suspense>
        <CartProvider>
          <SiteHeader />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
