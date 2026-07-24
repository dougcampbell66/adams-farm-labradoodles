import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lint runs separately, not as a build gate — same convention as Legend Manor.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
