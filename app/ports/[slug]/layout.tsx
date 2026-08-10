import { notFound } from "next/navigation";
import Breadcrumbs from "@/app/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";

const PORTS: Record<string, { name: string; description: string }> = {
  juneau: {
    name: "Juneau",
    description:
      "Cruise-port excursion storefront for Juneau, Alaska, with connected whale watching, glacier, dog sledding, flightseeing, fishing, and other shore excursions.",
  },
  skagway: {
    name: "Skagway",
    description:
      "Cruise-port excursion storefront for Skagway, Alaska, with connected helicopter, dog sledding, Gold Rush, sightseeing, and active shore excursions.",
  },
  ketchikan: {
    name: "Ketchikan",
    description:
      "Cruise-port excursion storefront for Ketchikan, Alaska, with connected wildlife, bear viewing, Misty Fjords, kayaking, flightseeing, fishing, and adventure excursions.",
  },
};

export default async function PortLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const port = PORTS[slug];
  if (!port) notFound();

  const canonical = `https://welcometoalaskatours.com/ports/${slug}`;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://welcometoalaskatours.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Ports",
        item: "https://welcometoalaskatours.com/ports",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${port.name} Shore Excursions`,
        item: canonical,
      },
    ],
  };

  const destinationSchema = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: `${port.name}, Alaska Cruise Port`,
    description: port.description,
    url: canonical,
    touristType: ["Cruise passengers", "Independent travelers"],
    containedInPlace: {
      "@type": "State",
      name: "Alaska",
    },
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={destinationSchema} />
      <div className="mx-auto max-w-6xl px-4 pt-5 sm:px-6">
        <Breadcrumbs
          items={[
            { href: "/", label: "Home" },
            { href: "/ports", label: "Ports" },
            { label: `${port.name} Shore Excursions` },
          ]}
        />
      </div>
      {children}
    </>
  );
}
