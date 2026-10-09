import { type ReactNode, Suspense } from "react";
import { AppShell, AuthGuard, PageLoading } from "@/components/shared";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell userRole="admin">
      <Suspense fallback={<PageLoading />}>
        <AuthGuard allowedRoles={["admin"]}>{children}</AuthGuard>
      </Suspense>
    </AppShell>
  );
}
