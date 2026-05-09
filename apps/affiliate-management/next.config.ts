import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  basePath: "/affiliate",
  transpilePackages: ["@workspace/ui", "@workspace/utils", "@workspace/types", "@workspace/hooks"],
  turbopack: {
    root: path.resolve(process.cwd(), "../../"),
  },
};

export default nextConfig;
