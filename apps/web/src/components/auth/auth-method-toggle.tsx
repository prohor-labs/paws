"use client";

import { Key, Sparkle } from "@/components/icons";

interface AuthMethodToggleProps {
  method: "magic-link" | "password";
  onMethodChange: (val: "magic-link" | "password") => void;
}

export function AuthMethodToggle({ method, onMethodChange }: AuthMethodToggleProps) {
  if (method === "magic-link") {
    return (
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => onMethodChange("password")}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <Key size={14} />
          <span>পাসওয়ার্ড দিয়ে লগ ইন করুন</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={() => onMethodChange("magic-link")}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <Sparkle size={14} />
        <span>ম্যাজিক লিংক দিয়ে লগ ইন করুন</span>
      </button>
    </div>
  );
}
