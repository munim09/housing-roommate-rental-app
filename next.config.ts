import type { NextConfig } from "next";

const backendUrl = new URL(
  process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "http://localhost:5000",
);

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    // Listing photos are served by the backend, so its origin has to be allowed.
    remotePatterns: [
      {
        protocol: backendUrl.protocol.replace(":", "") as "http" | "https",
        hostname: backendUrl.hostname,
        port: backendUrl.port,
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
