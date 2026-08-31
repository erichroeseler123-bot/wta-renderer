import "./globals.css";
import "./storefront.css";
import "./home-cleanup.css";
import type { Metadata, Viewport } from "next";
import CartDrawer from "@/app/components/cart/CartDrawer";
import StickyCartBar from "@/app/components/cart/StickyCartBar";
import CartProvider from "@/app/components/cart/CartContext";
import BackForwardRefresh from "@/app/BackForwardRefresh";
import IntentTracker from "@/app/components/analytics/IntentTracker";
import PublicStorefrontShell from "@/app/components/site/PublicStorefrontShell";
import JsonLd from "@/components/seo/JsonLd";
import { buildOrganizationSchema, buildWebsiteSchema } from "@/lib/tourSeo";

const siteDescription =
  "Plan Alaska cruise shore excursions in Juneau, Skagway, and Ketchikan. Compare connected tours by port and trip style, then open the booking calendar for current departures, pricing, and capacity.";

const socialImage = "https://welcometoalaskatours.com/hero/juneau.jpg";
const CRUISE_PROMENADE =
  "https://cruisepromenade.com/?utm_source=welcometoalaskatours&utm_medium=referral&utm_campaign=alaska_cruise_planning";

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
    images: [{ url: socialImage, width: 1200, height: 630, alt: "Alaska cruise shore excursions" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Welcome to Alaska Tours | Alaska Shore Excursion Planner",
    description: siteDescription,
    images: [socialImage],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1b1714",
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
          <IntentTracker />
          <PublicStorefrontShell>{children}</PublicStorefrontShell>
          <section className="border-t border-[#123632]/10 bg-[#eaf2ee] px-5 py-8 text-[#123632] sm:px-7 lg:px-10">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#46706a]">Already choosing Alaska excursions?</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight">Keep the whole cruise in one shared plan.</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#57706c]">Use Cruise Promenade to organize port days, booked activities and the plans your cruise group needs to see together.</p>
              </div>
              <a href={CRUISE_PROMENADE} className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-[#123632] px-5 text-sm font-black text-white transition hover:bg-[#214b46]">Open Cruise Promenade →</a>
            </div>
          </section>
          <StickyCartBar />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
