"use client";

import { magicLinkClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export interface UpdateUserInput {
  name?: string;
  image?: string;
  [key: string]: unknown;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

function resolveAuthBaseUrl(): string {
  if (typeof window !== "undefined") {
    return normalizeBaseUrl(window.location.origin);
  }

  return normalizeBaseUrl(
    process.env.INTERNAL_API_URL ||
      process.env.API_INTERNAL_URL ||
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "",
  );
}

export const authClient = createAuthClient({
  baseURL: resolveAuthBaseUrl(),
  basePath: "/api/v1/auth",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [magicLinkClient()],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;

export function getAuthClient() {
  return authClient;
}

export function updateUser(data: UpdateUserInput) {
  return authClient.updateUser(data as Parameters<typeof authClient.updateUser>[0]);
}

export type AuthClient = typeof authClient;
export type AuthSession = AuthClient["$Infer"]["Session"];
export type AuthUser = AuthSession["user"];
export type AuthSessionData = AuthSession["session"];
