import type { HealthResponse } from "../types/health";
import type { PresignedUploadInput, PresignedUrlResponse, UploadResponse } from "../types/upload";
import { getDefaultApiUrl, normalizeBaseUrl } from "./base-url";
import { ApiError } from "./errors";
import { createDedupedFetch } from "./fetch";
import { createRpcClient, type HcApp, type RpcClient, type RpcHeaders } from "./rpc";
import { getPresignedUploadUrl, uploadFile, uploadViaPresignedUrl } from "./upload";

export interface ApiClientConfig {
  baseUrl?: string;
  headers?: RpcHeaders;
  fetch?: typeof fetch;
}

export interface ApiClient<TAppType extends HcApp> {
  baseUrl: string;
  fetch: typeof fetch;
  rpc: RpcClient<TAppType>;
  health: {
    check: () => Promise<HealthResponse>;
  };
  storage: {
    upload: (file: File, folder?: string) => Promise<UploadResponse>;
    getPresignedUrl: (input: PresignedUploadInput) => Promise<PresignedUrlResponse>;
    uploadDirect: (file: File, folder?: string) => Promise<UploadResponse>;
  };
}

function withCredentialsFetch(
  baseFetch: typeof fetch,
  url: string,
  init?: RequestInit,
): Promise<Response> {
  return baseFetch(url, { ...init, credentials: "include" });
}

export function createApiClient<TAppType extends HcApp>(
  config: ApiClientConfig = {},
): ApiClient<TAppType> {
  const baseUrl = normalizeBaseUrl(config.baseUrl ?? getDefaultApiUrl());
  const apiFetch = config.fetch ?? createDedupedFetch();

  return {
    baseUrl,
    fetch: apiFetch,
    rpc: createRpcClient<TAppType>({ baseUrl, headers: config.headers, fetch: apiFetch }),
    health: {
      check: async () => {
        const response = await withCredentialsFetch(apiFetch, `${baseUrl}/api/v1/health`);
        if (!response.ok) {
          throw await ApiError.fromResponse(response, "Health check failed");
        }
        return (await response.json()) as HealthResponse;
      },
    },
    storage: {
      upload: (file, folder) => uploadFile(file, folder, { baseUrl, fetch: apiFetch }),
      getPresignedUrl: (input) => getPresignedUploadUrl(input, { baseUrl, fetch: apiFetch }),
      uploadDirect: (file, folder) =>
        uploadViaPresignedUrl(file, folder, { baseUrl, fetch: apiFetch }),
    },
  };
}
