/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Corrected key to allow your Chromebook internal IP
    serverActions: {
      allowedOrigins: ["100.115.92.197:3000", "localhost:3000"]
    }
  },
  // Disable telemetry to speed up the Chromebook build
  telemetry: false
};

export default nextConfig;
