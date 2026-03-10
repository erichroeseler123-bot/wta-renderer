import "./globals.css";
import type { Metadata, Viewport } from "next";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CruiseProvider } from "@/context/CruiseContext";
import CartProvider from "@/app/components/cart/CartContext";

export const metadata: Metadata = {
  metadataBase: new URL("https://welcometoalaskatours.com"),
  title: "Alaska Cruise Shore Excursions | Juneau, Skagway, Ketchikan | Welcome To Alaska Tours",
  description:
    "Book cruise-friendly Alaska shore excursions with trusted local operators. Real-time availability, secure checkout, and scheduling designed around your ship timing.",
  keywords: [
    "alaska shore excursions",
    "juneau tours",
    "skagway excursions",
    "ketchikan tours",
    "cruise excursions alaska",
  ],
  alternates: {
    canonical: "https://welcometoalaskatours.com",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Welcome To Alaska Tours",
    description:
      "Cruise-day shore excursions in Juneau, Skagway, and Ketchikan with live availability and secure checkout.",
    url: "https://welcometoalaskatours.com",
    siteName: "Welcome To Alaska Tours",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Welcome To Alaska Tours",
    description:
      "Cruise-day shore excursions in Juneau, Skagway, and Ketchikan with live availability.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0F172A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#F8FAFC]">
        <CartProvider>
          <CruiseProvider>
            <Header />
            {children}
            <Footer />
          </CruiseProvider>
        </CartProvider>
      </body>
    </html>
  );
}
