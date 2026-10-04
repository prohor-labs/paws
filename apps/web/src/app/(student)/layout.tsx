import { type ReactNode, Suspense } from "react";
import { AppShell, AuthGuard, PageLoading } from "@/components/shared";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell userRole="student">
      <Suspense fallback={<PageLoading />}>
        <AuthGuard>{children}</AuthGuard>
      </Suspense>
    </AppShell>
  );
}
