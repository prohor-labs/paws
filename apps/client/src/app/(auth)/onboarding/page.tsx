import type { Metadata } from "next";
import { Suspense } from "react";
import { OnboardingWizard } from "@/components/features/onboarding/onboarding-wizard";
import { AuthGuard, PageLoading } from "@/components/shared";

export const metadata: Metadata = {
  title: "Onboarding",
  description: "Set up your student profile and study targets",
};

export default function OnboardingPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <AuthGuard>
        <OnboardingWizard />
      </AuthGuard>
    </Suspense>
  );
}
