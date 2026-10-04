import type { Hono } from "hono";
import { hc } from "hono/client";
import { getDefaultApiUrl, normalizeBaseUrl } from "./base-url";
import { createDedupedFetch } from "./fetch";

export const API_V1_PREFIX = "/api/v1";

export type RpcHeaders =
  | Record<string, string>
  | (() => Record<string, string> | Promise<Record<string, string>>);

export interface RpcClientConfig {
  baseUrl?: string;
  headers?: RpcHeaders;
  fetch?: typeof fetch;
}

// biome-ignore lint/suspicious/noExplicitAny: mirrors hc's own constraint Hono<any, any, any>
export type HcApp = Hono<any, any, any>;

export type RpcClient<TApiType extends HcApp> = ReturnType<typeof hc<TApiType>>;

export function createRpcClient<TApiType extends HcApp>(
  config: RpcClientConfig = {},
): RpcClient<TApiType> {
  const origin = normalizeBaseUrl(config.baseUrl ?? getDefaultApiUrl());

  return hc<TApiType>(`${origin}${API_V1_PREFIX}`, {
    fetch: withCredentials(config.fetch ?? createDedupedFetch()),
    headers: config.headers,
  });
}

function withCredentials(baseFetch: typeof fetch): typeof fetch {
  return (input: RequestInfo | URL, init?: RequestInit) =>
    baseFetch(input, { ...init, credentials: "include" });
}
