"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[web] Route error", error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-xl font-bold tracking-tight text-foreground">কিছু একটা ভুল হয়েছে</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        পেজটি লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।
      </p>
      <Button type="button" onClick={reset} className="rounded-xl px-6">
        আবার চেষ্টা করুন
      </Button>
    </div>
  );
}
