import type { createAuthClient } from "../client/auth";

export type AuthClient = ReturnType<typeof createAuthClient>;
export type AuthSession = AuthClient["$Infer"]["Session"];
export type AuthUser = AuthSession["user"];
export type AuthSessionData = AuthSession["session"];
