import type { ApiRoutesType } from "@paws/api";
import { type ApiClient, createApiClient, getDefaultApiUrl } from "@paws/sdk";
import { cookies } from "next/headers";

function resolveApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || getDefaultApiUrl();
}

export async function getServerApiClient(): Promise<ApiClient<ApiRoutesType>> {
  const cookieStore = await cookies();
  return createApiClient<ApiRoutesType>({
    baseUrl: resolveApiUrl(),
    headers: { cookie: cookieStore.toString() },
  });
}
