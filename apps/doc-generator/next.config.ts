import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  basePath: "/doc-generator",
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
        "localhost:3008",
      ],
    },
  },
  turbopack: {
    root: path.resolve(process.cwd(), "../../"),
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/doc-generator/auth/login",
        basePath: false,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
