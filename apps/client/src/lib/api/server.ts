import { cookies } from "next/headers";
import { type ApiClient, createApiClient, normalizeBaseUrl } from "./client";

function resolveServerApiUrl(): string {
  return normalizeBaseUrl(
    process.env.INTERNAL_API_URL ||
      process.env.API_INTERNAL_URL ||
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "",
  );
}

export async function getServerApiClient(): Promise<ApiClient> {
  const cookieStore = await cookies();
  return createApiClient({
    baseUrl: resolveServerApiUrl(),
    headers: {
      cookie: cookieStore.toString(),
      ...(process.env.INTERNAL_PROXY_SECRET
        ? { "x-internal-proxy-secret": process.env.INTERNAL_PROXY_SECRET }
        : {}),
    },
  });
}
