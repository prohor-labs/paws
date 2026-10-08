import type { PresignedUploadInput, PresignedUrlResponse, UploadResponse } from "../types/upload";
import { getDefaultApiUrl, normalizeBaseUrl } from "./base-url";
import { ApiError } from "./errors";

const DEFAULT_FOLDER = "uploads";

export interface UploadRequestOptions {
  baseUrl?: string;
  fetch?: typeof fetch;
}

interface UploadEnvelope<T> {
  success: boolean;
  data: T;
}

async function parseUploadResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (!response.ok) {
    throw await ApiError.fromResponse(response, fallbackMessage);
  }

  const body = (await response.json()) as UploadEnvelope<T>;
  return body.data;
}

export async function uploadFile(
  file: File,
  folder = DEFAULT_FOLDER,
  options: UploadRequestOptions = {},
): Promise<UploadResponse> {
  const fetcher = options.fetch ?? fetch;
  const baseUrl = normalizeBaseUrl(options.baseUrl ?? getDefaultApiUrl());
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await fetcher(`${baseUrl}/api/v1/upload/direct`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  return parseUploadResponse<UploadResponse>(response, "Upload failed");
}

export async function getPresignedUploadUrl(
  input: PresignedUploadInput,
  options: UploadRequestOptions = {},
): Promise<PresignedUrlResponse> {
  const fetcher = options.fetch ?? fetch;
  const baseUrl = normalizeBaseUrl(options.baseUrl ?? getDefaultApiUrl());

  const response = await fetcher(`${baseUrl}/api/v1/upload/presigned`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseUploadResponse<PresignedUrlResponse>(response, "Presigned URL request failed");
}

export async function uploadViaPresignedUrl(
  file: File,
  folder = DEFAULT_FOLDER,
  options: UploadRequestOptions = {},
): Promise<UploadResponse> {
  const fetcher = options.fetch ?? fetch;
  const mimeType = file.type || "application/octet-stream";

  const presigned = await getPresignedUploadUrl({ filename: file.name, mimeType, folder }, options);

  const uploadResponse = await fetcher(presigned.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": mimeType },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new ApiError(`Storage upload failed with status ${uploadResponse.status}`, {
      status: uploadResponse.status,
      code: "STORAGE_UPLOAD_FAILED",
    });
  }

  return {
    url: presigned.downloadUrl,
    key: presigned.key,
    size: file.size,
    mimeType,
  };
}
