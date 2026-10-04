import type { ReactNode } from "react";
import { AuthBackdrop } from "@/components/auth";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 py-8 text-foreground">
      <AuthBackdrop />
      <div className="relative z-10 w-full flex items-center justify-center">{children}</div>
    </div>
  );
}
