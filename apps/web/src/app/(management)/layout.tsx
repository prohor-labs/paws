import { type ReactNode, Suspense } from "react";
import { AppShell, AuthGuard, PageLoading } from "@/components/shared";

export default function ManagementLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell userRole="admin">
      <Suspense fallback={<PageLoading />}>
        <AuthGuard allowedRoles={["admin", "mentor"]}>{children}</AuthGuard>
      </Suspense>
    </AppShell>
  );
}
