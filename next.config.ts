import type { NextConfig } from "next";

// Application privée servie à la racine par Cloudflare Pages (export statique + Pages Functions).
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
