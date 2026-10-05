const isProduction = process.env.NODE_ENV === "production";

function readNumber(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readCsv(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function readRequiredInProduction(name: string, developmentFallback: string): string {
  const value = process.env[name];
  if (value) {
    return value;
  }
  if (isProduction) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return developmentFallback;
}

export const env = {
  isProduction,
  port: readNumber(process.env.PORT, 7000),
  hostname: process.env.HOST ?? "0.0.0.0",
  databaseUrl: readRequiredInProduction(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/pawfessor",
  ),
  databaseMaxConnections: readNumber(process.env.DB_MAX_CONNECTIONS, 30),
  databasePrepare: process.env.DB_PREPARE === "true",
  betterAuthUrl: process.env.BETTER_AUTH_URL ?? "http://localhost:7000",
  betterAuthSecret: readRequiredInProduction(
    "BETTER_AUTH_SECRET",
    "development-secret-key-at-least-32-chars-long",
  ),
  webUrl: process.env.NEXT_PUBLIC_APP_URL ?? process.env.CORS_ORIGIN ?? "http://localhost:7001",
  trustedOrigins: readCsv(process.env.TRUSTED_ORIGINS),
  internalProxySecret: process.env.INTERNAL_PROXY_SECRET ?? "",
  uploadMaxBytes: readNumber(process.env.UPLOAD_MAX_BYTES, 10 * 1024 * 1024),
  aws: {
    region: process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? "garage",
    endpoint:
      process.env.AWS_ENDPOINT || process.env.AWS_ENDPOINT_URL_S3 || process.env.AWS_ENDPOINT_URL,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    bucket: process.env.AWS_BUCKET_NAME ?? process.env.S3_BUCKET_NAME ?? "study",
    publicUrl: process.env.AWS_PUBLIC_URL ?? process.env.S3_BUCKET_URL ?? "",
    forcePathStyle:
      process.env.AWS_FORCE_PATH_STYLE === "true" ||
      Boolean(process.env.AWS_ENDPOINT || process.env.AWS_ENDPOINT_URL),
  },
};
