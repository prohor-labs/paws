"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useEffect, useSyncExternalStore } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/lib/sdk";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  const mounted = useMounted();

  const user = session?.user as
    | (NonNullable<typeof session>["user"] & { onboardingCompleted?: boolean })
    | undefined;

  useEffect(() => {
    if (!mounted || isPending) return;

    if (!session) {
      const queryString = searchParams?.toString();
      const currentPath = `${pathname}${queryString ? `?${queryString}` : ""}`;
      const loginUrl =
        currentPath && currentPath !== "/"
          ? `/login?redirect=${encodeURIComponent(currentPath)}`
          : "/login";
      router.replace(loginUrl);
      return;
    }

    const isOnboardingPage = pathname === "/onboarding";
    const hasCompletedOnboarding = Boolean(user?.onboardingCompleted);

    if (!hasCompletedOnboarding && !isOnboardingPage) {
      router.replace("/onboarding");
    } else if (hasCompletedOnboarding && isOnboardingPage) {
      router.replace("/dashboard");
    }
  }, [mounted, isPending, session, user, router, pathname, searchParams]);

  if (!mounted || isPending || !session) {
    return <AuthGuardLoading />;
  }

  const isOnboardingPage = pathname === "/onboarding";
  const hasCompletedOnboarding = Boolean(user?.onboardingCompleted);

  if (!hasCompletedOnboarding && !isOnboardingPage) {
    return <AuthGuardLoading />;
  }

  if (hasCompletedOnboarding && isOnboardingPage) {
    return <AuthGuardLoading />;
  }

  return <>{children}</>;
}

const emptySubscribe = () => () => {};

function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

function AuthGuardLoading() {
  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <Spinner className="size-6 text-primary" />
    </div>
  );
}
