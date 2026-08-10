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
      { source: "/home", destination: "/", permanent: true },
      { source: "/contact", destination: "/contact-us", permanent: true },
    ];
  },
};

export default nextConfig;
