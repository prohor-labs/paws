import type { ApiRoutesType, Auth } from "@paws/api";
import {
  type ApiClient,
  ApiError,
  createApiClient,
  createAuthClient,
  getDefaultApiUrl,
  type InferRequestType,
  type InferResponseType,
  isApiError,
} from "@paws/sdk";

export type AppApiClient = ApiClient<ApiRoutesType>;
export type AuthClient = ReturnType<typeof createAuthClient<Auth>>;

export interface UpdateUserInput {
  name?: string;
  image?: string;
  [key: string]: unknown;
}

function resolveApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || getDefaultApiUrl();
}

let apiClient: AppApiClient | undefined;
let authClientInstance: AuthClient | undefined;

export function getApiClient(): AppApiClient {
  if (!apiClient) {
    apiClient = createApiClient<ApiRoutesType>({ baseUrl: resolveApiUrl() });
  }
  return apiClient;
}

export function getAuthClient(): AuthClient {
  if (!authClientInstance) {
    authClientInstance = createAuthClient<Auth>({ baseUrl: resolveApiUrl() });
  }
  return authClientInstance;
}

export const api: AppApiClient = getApiClient();
export const authClient: AuthClient = getAuthClient();

export const { signIn, signUp, signOut, useSession, getSession } = authClient;

export function updateUser(data: UpdateUserInput) {
  return getAuthClient().updateUser(data as Parameters<AuthClient["updateUser"]>[0]);
}

export function uploadFile(file: File, folder = "uploads") {
  return getApiClient().storage.upload(file, folder);
}

export type PresignedUploadRequest = InferRequestType<
  AppApiClient["rpc"]["upload"]["presigned"]["$post"]
>;
export type PresignedUploadResponse = InferResponseType<
  AppApiClient["rpc"]["upload"]["presigned"]["$post"],
  200
>;

export function getPresignedUploadUrl(input: PresignedUploadRequest["json"]) {
  return getApiClient().storage.getPresignedUrl(input);
}

export { ApiError, isApiError };
