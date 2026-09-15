import path from "node:path";
import { createMDX } from "fumadocs-mdx/next";

// The content lives one level up (../docs, ../mockups), so the bundler root is the repo root.
const repoRoot = path.resolve(import.meta.dirname, "..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  turbopack: { root: repoRoot },
  outputFileTracingRoot: repoRoot,
};

export default createMDX()(nextConfig);
