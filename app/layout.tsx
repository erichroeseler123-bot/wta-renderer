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
  title: "Juneau Helicopter Tours | Welcome To Alaska Tours",
  description:
    "Browse Juneau helicopter tours, choose a date, add your departure to the cart, and check out securely.",
  keywords: [
    "juneau helicopter tours",
    "alaska helicopter tours",
    "juneau glacier helicopter",
    "book helicopter tours alaska",
  ],
  alternates: {
    canonical: "https://welcometoalaskatours.com",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Welcome To Alaska Tours",
    description:
      "Juneau helicopter tours with simple booking and secure checkout.",
    url: "https://welcometoalaskatours.com",
    siteName: "Welcome To Alaska Tours",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Welcome To Alaska Tours",
    description:
      "Juneau helicopter tours with simple booking and secure checkout.",
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
