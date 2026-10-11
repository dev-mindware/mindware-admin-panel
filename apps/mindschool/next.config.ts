import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  basePath: "/mindschool",
  reactStrictMode: true,
  transpilePackages: ["@workspace/ui", "@workspace/utils", "@workspace/types", "@workspace/hooks"],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "test.panel.mindware-vps.cloud",
        "panel.mindware-vps.cloud",
        "*.mindware-vps.cloud",
        "*.vercel.app",
        "localhost:3000",
        "localhost:3009",
      ],
    },
  },
  turbopack: {
    root: path.resolve(process.cwd(), "../../"),
  },
};

export default nextConfig;
