import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite (local fallback DB) ships WASM; keep it out of the server bundle.
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
