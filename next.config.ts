import type { NextConfig } from "next";

// GitHub Pages sert le site sous /game-vault — basePath activé uniquement en CI de déploiement.
const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isGitHubPages ? "/game-vault" : "",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
