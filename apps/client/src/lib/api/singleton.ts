import { type ApiClient, createApiClient } from "./client";

let apiClient: ApiClient | undefined;

export function getApiClient(): ApiClient {
  if (!apiClient) {
    apiClient = createApiClient();
  }
  return apiClient;
}

export const api: ApiClient = getApiClient();

export function uploadFile(file: File, folder = "uploads") {
  return getApiClient().storage.upload(file, folder);
}

export function uploadDirect(file: File, folder = "uploads") {
  return getApiClient().storage.uploadDirect(file, folder);
}

export function getPresignedUploadUrl(input: {
  filename: string;
  mimeType: string;
  folder?: string;
}) {
  return getApiClient().storage.getPresignedUrl(input);
}
