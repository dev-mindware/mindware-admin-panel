import type { NextConfig } from "next";
import path from "node:path";

const rawMindgestUrl = process.env.MINDGEST_URL || "http://localhost:3000";
const rawAffiliateUrl = process.env.AFFILIATE_URL || "http://localhost:3002";

// Clean base URLs by removing trailing slashes and redundant subpaths if misconfigured in env vars
const MINDGEST_URL = rawMindgestUrl.replace(/\/mindgest\/?$/, "").replace(/\/$/, "");
const AFFILIATE_URL = rawAffiliateUrl.replace(/\/affiliate\/?$/, "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/utils", "@workspace/types", "@workspace/hooks"],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "test.panel.mindware-vps.cloud",
        "panel.mindware-vps.cloud",
        "mindgest.mindware.ao",
        "*.mindware-vps.cloud",
        "*.vercel.app",
        "localhost:3000",
        "localhost:3006",
      ],
    },
  },
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
