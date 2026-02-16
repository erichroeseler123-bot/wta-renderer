import "./globals.css";
import CartProvider from "./components/cart/CartContext";
import CartDrawer from "./components/cart/CartDrawer";
import type { Metadata } from "next";
import Script from "next/script";
import Nav from "./components/Nav";

import JsonLd from "../components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Welcome to Alaska",
  description:
    "Ports, tours, and logistics. Live FareHarbor inventory (affiliate access).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white">
        <Script
          src="https://fareharbor.com/embeds/api/v1/"
          strategy="afterInteractive"
        />
        {/* Basic site JSON-LD (safe, non-spammy) */}
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Welcome to Alaska",
            url: "https://welcome-to-alaska-tours.com",
            description:
              "Ports, tours, and logistics. Build a multi-stop itinerary with live inventory.",
          }}
        />

        <CartProvider>
          <Nav />
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
