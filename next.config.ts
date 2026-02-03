import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    // use an absolute path to ensure Turbopack resolves modules from this app
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
