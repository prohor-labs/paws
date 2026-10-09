import type { authClient } from "../../auth/client";

export type AuthClient = typeof authClient;
export type AuthSession = AuthClient["$Infer"]["Session"];
export type AuthUser = AuthSession["user"] & {
  role?: "student" | "mentor" | "admin";
  onboardingCompleted?: boolean;
  level?: string | null;
  educationalStandard?: string | null;
  track?: string | null;
  dailyReminderEnabled?: boolean;
};
export type AuthSessionData = AuthSession["session"];
