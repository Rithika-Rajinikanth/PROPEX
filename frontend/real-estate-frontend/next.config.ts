// frontend/real-estate-frontend/next.config.ts
//
// ONLY CHANGE from original: added  output: "standalone"
// Required for the Docker image to produce a runnable server.js
// Everything else is identical to your existing file.

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",   // ← required for Docker / Azure deployment

  reactCompiler: true,

  images: {
    domains: ["localhost"],
  },

  // rewrites() is intentionally minimal here.
  // All API proxying is handled by src/middleware.ts at runtime,
  // which reads API_URL and ML_URL from Azure env vars.
  // This means no rebuild is needed when URLs change.
};

export default nextConfig;