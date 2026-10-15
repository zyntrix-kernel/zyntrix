import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  async rewrites() {
    return {
      beforeFiles: [
        // Serve the static Zyntrix brand showcase at a clean URL
        // (public/zyntrix/index.html) instead of 404ing on /zyntrix.
        { source: "/zyntrix", destination: "/zyntrix/index.html" },
        { source: "/zyntrix/", destination: "/zyntrix/index.html" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
