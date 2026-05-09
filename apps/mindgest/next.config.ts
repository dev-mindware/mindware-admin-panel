import type { NextConfig } from "next";
import path from "node:path";

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: any = {
  basePath: "/mindgest",
  reactStrictMode: true,
  transpilePackages: ["@workspace/ui", "@workspace/utils", "@workspace/types", "@workspace/hooks"],
  turbopack: {
    root: path.resolve(process.cwd(), "../../"),
  },
};

export default withBundleAnalyzer(nextConfig);
