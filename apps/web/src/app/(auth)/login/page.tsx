import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginView } from "@/components/auth";
import { PageLoading } from "@/components/shared";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in or create an account on Paws Academy",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <LoginView />
    </Suspense>
  );
}
