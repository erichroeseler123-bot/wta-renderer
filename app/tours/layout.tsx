import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Alaska Shore Excursions | Welcome To Alaska Tours",
  description:
    "Browse Alaska shore excursions by port, cruise fit, and category. Compare live availability and prices in Juneau, Skagway, and Ketchikan.",
  alternates: {
    canonical: "https://welcometoalaskatours.com/tours",
  },
  openGraph: {
    title: "Browse Alaska Shore Excursions",
    description:
      "Find cruise-day tours by port and schedule fit with live availability from local operators.",
    url: "https://welcometoalaskatours.com/tours",
    type: "website",
  },
};

export default function ToursLayout({ children }: { children: React.ReactNode }) {
  return children;
}
