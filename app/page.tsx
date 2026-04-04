import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Choose Your Alaska Excursion | Welcome To Alaska Tours",
  description:
    "Decision-first Alaska routing for cruise travelers who should start with the right shortlist before opening a booking calendar.",
  alternates: { canonical: "https://welcometoalaskatours.com" },
};

export default function HomePage() {
  redirect("/plan?intent=best-for&topic=juneau-helicopter-tours&subtype=helicopter&port=juneau");
}
