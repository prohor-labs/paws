"use client";

import { ArrowRight, Send } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface AuthSubmitButtonProps {
  mode: "signin" | "signup";
  method: "magic-link" | "password";
  isLoading: boolean;
  disabled: boolean;
}

export function AuthSubmitButton({ mode, method, isLoading, disabled }: AuthSubmitButtonProps) {
  if (isLoading) {
    return (
      <Button type="submit" className="h-10 w-full font-medium" disabled>
        <Spinner className="mr-2 size-4" />
      </Button>
    );
  }

  const label =
    mode === "signup"
      ? "রেজিস্ট্রেশন সম্পন্ন করুন"
      : method === "magic-link"
        ? "ম্যাজিক লিংক পাঠান"
        : "লগ ইন করুন";

  const isMagic = method === "magic-link" && mode === "signin";

  return (
    <Button type="submit" className="h-10 w-full font-medium" disabled={disabled}>
      <span>{label}</span>
      {isMagic ? (
        <Send size={16} aria-hidden="true" />
      ) : (
        <ArrowRight size={16} aria-hidden="true" />
      )}
    </Button>
  );
}
