import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root so Next doesn't infer it from an unrelated
  // lockfile higher up the tree (e.g. /home/solufy/package-lock.json).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
