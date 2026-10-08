import { createAuthClient as createVanillaAuthClient } from "better-auth/client";
import { magicLinkClient } from "better-auth/client/plugins";
import { getDefaultApiUrl, normalizeBaseUrl } from "../client/base-url";
import { createDedupedFetch } from "../client/fetch";
import type { HcApp } from "../client/rpc";
import { createRpcClient, type RpcClient, type RpcHeaders } from "../client/rpc";

export { getDefaultApiUrl, normalizeBaseUrl };

export interface ServerApiClientConfig {
  baseUrl?: string;
  headers?: RpcHeaders;
  fetch?: typeof fetch;
}

export function createServerApiClient<TApiType extends HcApp>(
  config: ServerApiClientConfig = {},
): RpcClient<TApiType> {
  return createRpcClient<TApiType>({
    baseUrl: config.baseUrl ?? getDefaultApiUrl(),
    headers: config.headers,
    fetch: config.fetch ?? createDedupedFetch(),
  });
}

export interface ServerAuthClientConfig {
  baseUrl?: string;
  headers?: Record<string, string>;
}

export function createServerAuthClient(config: ServerAuthClientConfig = {}) {
  return createVanillaAuthClient({
    baseURL: normalizeBaseUrl(config.baseUrl ?? getDefaultApiUrl()),
    fetchOptions: {
      credentials: "include",
      headers: config.headers,
    },
    plugins: [magicLinkClient()],
  });
}
