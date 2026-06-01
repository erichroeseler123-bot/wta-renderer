import "./globals.css";
import type { Metadata, Viewport } from "next";
import CartProvider from "@/app/components/cart/CartContext";
import CartButton from "@/app/components/cart/CartButton";
import CartDrawer from "@/app/components/cart/CartDrawer";
import Link from "next/link";
import BackForwardRefresh from "@/app/BackForwardRefresh";
import JsonLd from "@/components/seo/JsonLd";
import { buildOrganizationSchema, buildWebsiteSchema } from "@/lib/tourSeo";

export const metadata: Metadata = {
  metadataBase: new URL("https://welcometoalaskatours.com"),
  title: {
    default: "Alaska Tours by Port, Timing & Traveler Fit | Welcome To Alaska Tours",
    template: "%s | Welcome To Alaska Tours",
  },
  description:
    "Find the right Alaska tour for your cruise port, schedule, and group. Browse whale watching, glacier, helicopter, wildlife, and train tours with cruise-safe timing notes.",
  keywords: [
    "alaska tours",
    "alaska cruise port tours",
    "alaska shore excursions",
    "juneau tours",
    "skagway tours",
    "ketchikan tours",
    "alaska whale watching tours",
    "alaska glacier tours",
  ],
  alternates: {
    canonical: "https://welcometoalaskatours.com",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Welcome To Alaska Tours",
    description:
      "Alaska tours sorted by port, timing, and traveler fit. Browse by cruise port and compare tour types.",
    url: "https://welcometoalaskatours.com",
    siteName: "Welcome To Alaska Tours",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Welcome To Alaska Tours",
    description:
      "Alaska tours sorted by port, timing, and traveler fit. Browse by cruise port and compare tour types.",
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
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur sm:inset-auto sm:bottom-4 sm:right-4 sm:left-auto sm:w-auto sm:rounded-2xl sm:border sm:shadow-xl">
            <div className="mx-auto flex max-w-3xl items-center gap-3 sm:max-w-none">
              <Link
                href="/checkout"
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white sm:flex-none"
              >
                Checkout
              </Link>
              <CartButton />
            </div>
          </div>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
