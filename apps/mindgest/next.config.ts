import type { NextConfig } from "next";
import path from "node:path";

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: any = {
  basePath: "/mindgest",
  reactStrictMode: true,
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
        "localhost:3005",
      ],
    },
  },
  turbopack: {
    root: path.resolve(process.cwd(), "../../"),
  },
};

export default withBundleAnalyzer(nextConfig);
