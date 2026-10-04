import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  allowedDevOrigins: ["79.143.185.101"],
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "study.storage.prohor.dev",
      },
      {
        protocol: "https",
        hostname: "s3.prohor.dev",
      },
      {
        protocol: "https",
        hostname: "*.storage.prohor.dev",
      },
      {
        protocol: "https",
        hostname: "*.prohor.dev",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.neon.tech",
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "reicon-react",
      "date-fns",
      "recharts",
      "sonner",
      "zustand",
      "@tanstack/react-query",
      "@base-ui/react",
      "ai",
      "@ai-sdk/react",
      "react-markdown",
      "remark-math",
      "remark-gfm",
      "rehype-mathjax",
      "rehype-raw",
      "cmdk",
      "react-day-picker",
      "embla-carousel-react",
      "input-otp",
      "react-resizable-panels",
    ],
  },
  async rewrites() {
    const internalApi =
      process.env.INTERNAL_API_URL || process.env.API_INTERNAL_URL || process.env.API_URL || "";
    if (!internalApi) {
      return [];
    }
    return [
      {
        source: "/api/v1/:path*",
        destination: `${internalApi}/api/v1/:path*`,
      },
      {
        source: "/api/auth/:path*",
        destination: `${internalApi}/api/auth/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), geolocation=(), microphone=()" },
          { key: "X-Robots-Tag", value: "noai, noimageai, noimageindex, nosnippet" },
          {
            key: "X-Legal-Protection",
            value:
              "BD-GOV-TRD/DH-849201-B | Copyright Act 2000 Act-XXVIII | Cyber Security Act Sec 17/28",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
