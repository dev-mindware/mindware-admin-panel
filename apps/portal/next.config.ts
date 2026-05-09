import type { NextConfig } from "next";
import path from "node:path";

const MINDGEST_URL = process.env.MINDGEST_URL || "http://localhost:3002";
const AFFILIATE_URL = process.env.AFFILIATE_URL || "http://localhost:3001";

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/utils", "@workspace/types", "@workspace/hooks"],
  turbopack: {
    root: path.resolve(process.cwd(), "../../"),
  },
  async rewrites() {
    return [
      {
        source: "/mindgest",
        destination: `${MINDGEST_URL}/mindgest`,
      },
      {
        source: "/mindgest/:path*",
        destination: `${MINDGEST_URL}/mindgest/:path*`,
      },
      {
        source: "/affiliate",
        destination: `${AFFILIATE_URL}/affiliate`,
      },
      {
        source: "/affiliate/:path*",
        destination: `${AFFILIATE_URL}/affiliate/:path*`,
      },
    ];
  },
};

export default nextConfig;
