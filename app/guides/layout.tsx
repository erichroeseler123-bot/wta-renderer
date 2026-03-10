import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alaska Cruise Planning Guides | Welcome To Alaska Tours",
  description:
    "Port-by-port planning guides for Alaska cruise excursions, including Juneau, Skagway, and Ketchikan booking tips.",
  alternates: {
    canonical: "https://welcometoalaskatours.com/guides",
  },
  openGraph: {
    title: "Alaska Cruise Planning Guides",
    description:
      "Actionable Alaska shore excursion guides for cruise travelers looking for reliable, cruise-day-friendly bookings.",
    url: "https://welcometoalaskatours.com/guides",
    type: "website",
  },
};

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
