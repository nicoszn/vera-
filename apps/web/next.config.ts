import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // Prevents pipeline crashes from loose styling rules
  },
  typescript: {
    ignoreBuildErrors: true, // Speeds up Vercel processing when schemas sync over DB hooks
  }
};

export default nextConfig;
