"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[web] Global error", error);
  }, [error]);

  return (
    <html lang="bn">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground font-sans p-6 text-center">
        <h2 className="text-xl font-bold">অ্যাপ্লিকেশন ত্রুটি</h2>
        <p className="text-sm text-muted-foreground">একটি অপ্রত্যাশিত সমস্যা হয়েছে। পেজ রিলোড করুন।</p>
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground cursor-pointer shadow-xs"
        >
          আবার চেষ্টা করুন
        </button>
      </body>
    </html>
  );
}
