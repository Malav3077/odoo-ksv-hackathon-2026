import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root so Next doesn't infer it from an unrelated
  // lockfile higher up the tree (e.g. /home/solufy/package-lock.json).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
