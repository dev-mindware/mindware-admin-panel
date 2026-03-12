import type { NextConfig } from "next";

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: any = {
  reactStrictMode: true,
  turbopack: {
    root: "./",
  },
};

export default withBundleAnalyzer(nextConfig);
