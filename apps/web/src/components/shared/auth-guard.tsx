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

  useEffect(() => {
    if (mounted && !isPending && !session) {
      const queryString = searchParams?.toString();
      const currentPath = `${pathname}${queryString ? `?${queryString}` : ""}`;
      const loginUrl =
        currentPath && currentPath !== "/"
          ? `/login?redirect=${encodeURIComponent(currentPath)}`
          : "/login";
      router.replace(loginUrl);
    }
  }, [mounted, isPending, session, router, pathname, searchParams]);

  if (!mounted || isPending) {
    return <AuthGuardLoading />;
  }

  if (!session) {
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
