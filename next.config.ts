import type { NextConfig } from "next";

const BASE_CSP =
  "default-src 'self'; base-uri 'self'; object-src 'none'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://m.stripe.network https://challenges.cloudflare.com https://vercel.live https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https: http:; font-src 'self' data: https:; connect-src 'self' https://api.stripe.com https://r.stripe.com https://m.stripe.network https://q.stripe.com https://challenges.cloudflare.com https://vercel.live https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com; frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://challenges.cloudflare.com https://vercel.live; worker-src 'self' blob:";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.filestackcontent.com",
      },
      {
        protocol: "https",
        hostname: "www.filepicker.io",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
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
  async headers() {
    return [
      {
        source: "/((?!widget(?:/|$)).*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Content-Security-Policy",
            value: `${BASE_CSP}; frame-ancestors 'self'`,
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
      {
        source: "/(admin|checkout|api/admin|api/stripe)/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Content-Security-Policy",
            value: `${BASE_CSP}; frame-ancestors 'none'`,
          },
          {
            key: "Cache-Control",
            value: "private, no-store, no-cache, must-revalidate",
          },
        ],
      },
      {
        source: "/widget",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `${BASE_CSP}; frame-ancestors *`,
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=1, stale-while-revalidate=5",
          },
        ],
      },
      {
        source: "/widget/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `${BASE_CSP}; frame-ancestors *`,
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=1, stale-while-revalidate=5",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
