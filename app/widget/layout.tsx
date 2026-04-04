import type { Metadata } from "next";
import WidgetResizeReporter from "@/components/widget/WidgetResizeReporter";

export const metadata: Metadata = {
  title: "Tour Widget | Welcome To Alaska Tours",
  description: "Embedded Juneau helicopter tour catalog.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://welcometoalaskatours.com/tours",
  },
};

export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WidgetResizeReporter />
      {children}
    </>
  );
}
