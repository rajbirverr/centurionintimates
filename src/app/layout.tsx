import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "Centurion - Premium Jewelry & Accessories",
  description: "Discover our handcrafted jewelry collection. Centurion makes jewelry that's playful, pretty, and totally extra — for days when you wanna shine like you mean it.",
  keywords: "jewelry, accessories, bangles, earrings, bracelets, necklace, rings, anklets, fashion, centurion",
  openGraph: {
    title: "Centurion - Premium Jewelry & Accessories",
    description: "Discover our handcrafted jewelry collection.",
    type: "website",
    locale: "en_IN",
    siteName: "Centurion",
  },
};

import { Playfair_Display, Lato } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair'
});

const lato = Lato({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-lato'
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
      </head>
      <body className={`antialiased ${playfair.variable} ${lato.variable} font-sans`}>
        <CartProvider>
          <NavBar />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
