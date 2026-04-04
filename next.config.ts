import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.filestackcontent.com",
      },
      {
        protocol: "https",
        hostname: "d1a2dkr8rai8e2.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/home", destination: "/", permanent: false },
      { source: "/about", destination: "/", permanent: false },
      { source: "/contact", destination: "/", permanent: false },
      { source: "/contact-us", destination: "/", permanent: false },
      { source: "/guides", destination: "/", permanent: false },
      { source: "/guides/:path*", destination: "/", permanent: false },
      { source: "/ports", destination: "/", permanent: false },
      { source: "/ports/:path*", destination: "/", permanent: false },
      { source: "/tours", destination: "/", permanent: false },
      { source: "/privacy", destination: "/", permanent: false },
      { source: "/terms", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
