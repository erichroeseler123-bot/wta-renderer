import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Welcome To Alaska Tours",
    short_name: "Alaska Tours",
    description:
      "Cruise-friendly Alaska shore excursions with live availability, secure checkout, and confirmation tracking.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/next.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
