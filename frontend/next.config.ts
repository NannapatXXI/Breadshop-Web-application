import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // [Claude] อนุญาตโหลด image จาก localhost:8080 (backend) และ unpkg.com (Leaflet icons)
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '8080' },
      { protocol: 'https', hostname: 'unpkg.com' },
    ],
  },
};

export default nextConfig;
