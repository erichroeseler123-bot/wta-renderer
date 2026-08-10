import "./globals.css";
import type { Metadata, Viewport } from "next";
import CartDrawer from "@/app/components/cart/CartDrawer";
import StickyCartBar from "@/app/components/cart/StickyCartBar";
import CartProvider from "@/app/components/cart/CartContext";
import BackForwardRefresh from "@/app/BackForwardRefresh";
import JsonLd from "@/components/seo/JsonLd";
import { buildOrganizationSchema, buildWebsiteSchema } from "@/lib/tourSeo";

const siteDescription =
  "Plan Alaska cruise shore excursions in Juneau, Skagway, and Ketchikan. Compare connected tours by port and trip style, then open the booking calendar for current departures, pricing, and capacity.";

export const metadata: Metadata = {
  metadataBase: new URL("https://welcometoalaskatours.com"),
  title: {
    default: "Welcome to Alaska Tours | Alaska Shore Excursion Planner",
    template: "%s | Welcome to Alaska Tours",
  },
  description: siteDescription,
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "Welcome to Alaska Tours | Alaska Shore Excursion Planner",
    description: siteDescription,
    url: "./",
    siteName: "Welcome to Alaska Tours",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Welcome to Alaska Tours | Alaska Shore Excursion Planner",
    description: siteDescription,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0F172A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationSchema = buildOrganizationSchema();
  const websiteSchema = buildWebsiteSchema();

  return (
    <html lang="en">
      <body className="antialiased bg-stone-50 text-slate-900">
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        <CartProvider>
          <BackForwardRefresh />
          {children}
          <StickyCartBar />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
