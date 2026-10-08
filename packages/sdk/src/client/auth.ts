import { magicLinkClient } from "better-auth/client/plugins";
import { createAuthClient as createReactAuthClient } from "better-auth/react";
import { getDefaultApiUrl, normalizeBaseUrl } from "./base-url";

export interface AuthClientConfig {
  baseUrl?: string;
  fetchOptions?: RequestInit;
}

export function createAuthClient<TServerAuth = never>(config: AuthClientConfig = {}) {
  const client = createReactAuthClient({
    baseURL: normalizeBaseUrl(config.baseUrl ?? getDefaultApiUrl()),
    fetchOptions: {
      credentials: "include",
      ...config.fetchOptions,
    },
    plugins: [magicLinkClient()],
  });

  return client as TServerAuth extends { $Infer: infer ServerInfer }
    ? typeof client & { $Infer: ServerInfer }
    : typeof client;
}

export type DefaultAuthClient = ReturnType<typeof createAuthClient>;

let browserAuthClient: DefaultAuthClient | undefined;

export function getAuthClient(config?: AuthClientConfig): DefaultAuthClient {
  if (!browserAuthClient) {
    browserAuthClient = createAuthClient(config);
  }
  return browserAuthClient;
}

export function updateUser(data: { name?: string; image?: string; [key: string]: unknown }) {
  return getAuthClient().updateUser(data as Parameters<DefaultAuthClient["updateUser"]>[0]);
}
