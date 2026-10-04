import { env } from "./env";

const LOOPBACK_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);
const PRIVATE_IPV4 =
  /^(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})$/;

export const STATIC_TRUSTED_ORIGINS: readonly string[] = [
  ...env.trustedOrigins,
  env.webUrl,
  env.betterAuthUrl,
  "https://api.prohor.dev",
  "https://app.prohor.dev",
  "https://paws.academy",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3003",
  "http://79.143.185.101:3003",
];

export function isTrustedOrigin(origin: string | undefined): boolean {
  if (!origin) {
    return false;
  }
  if (STATIC_TRUSTED_ORIGINS.includes(origin)) {
    return true;
  }

  try {
    const { hostname } = new URL(origin);
    if (LOOPBACK_HOSTNAMES.has(hostname) || PRIVATE_IPV4.test(hostname)) {
      return true;
    }
    // Allow vercel deployments and prohor / paws domains
    if (
      hostname.endsWith(".vercel.app") ||
      hostname.endsWith("prohor.dev") ||
      hostname.endsWith("paws.academy") ||
      hostname === "localhost"
    ) {
      return true;
    }
    return !env.isProduction;
  } catch {
    return false;
  }
}

