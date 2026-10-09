import { type ReactNode, Suspense } from "react";
import { AppShell, AuthGuard, PageLoading } from "@/components/shared";

export default function MentorLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell userRole="mentor">
      <Suspense fallback={<PageLoading />}>
        <AuthGuard allowedRoles={["mentor", "admin"]}>{children}</AuthGuard>
      </Suspense>
    </AppShell>
  );
}
