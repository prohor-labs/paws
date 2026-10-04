"use client";

import { type FormEvent, useState } from "react";
import { CheckCircle } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LandingJoin() {
  const [emailInput, setEmailInput] = useState("");
  const [signupStatus, setSignupStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const handleSignupSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const val = emailInput.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);

    if (!isValid) {
      setSignupStatus("error");
      setStatusMessage("সঠিক ইমেইল ঠিকানা দিন।");
      return;
    }

    setSignupStatus("success");
    setStatusMessage("ধন্যবাদ! আপনি সফলভাবে সাবস্ক্রাইব করেছেন।");
    setEmailInput("");
  };

  return (
    <section id="join" className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-2xl rounded-3xl border border-border/60 bg-card/60 p-8 text-center shadow-xl backdrop-blur-md sm:p-12">
        <h2 className="mb-3 font-bold text-3xl sm:text-4xl">অ্যাকাডেমিতে যুক্ত হোন</h2>
        <p className="mb-8 text-muted-foreground text-sm sm:text-base">
          নতুন মক টেস্ট ও কোর্স আপডেটের জন্য আপনার ইমেইল দিয়ে যুক্ত থাকুন।
        </p>

        <form onSubmit={handleSignupSubmit} className="w-full">
          <FieldGroup className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Field data-invalid={signupStatus === "error" ? true : undefined} className="flex-1">
              <Input
                id="contact"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  if (signupStatus !== "idle") setSignupStatus("idle");
                }}
                placeholder="আপনার ইমেইল ঠিকানা দিন"
                aria-label="ইমেইল ঠিকানা"
                className="h-11 rounded-full px-5"
              />
              {signupStatus === "error" && (
                <FieldDescription className="text-destructive text-xs">
                  {statusMessage}
                </FieldDescription>
              )}
            </Field>
            <Button type="submit" size="lg" className="h-11 rounded-full px-8 font-semibold">
              যুক্ত হোন
            </Button>
          </FieldGroup>
        </form>

        {signupStatus === "success" && (
          <div className="mt-4 flex items-center justify-center gap-2 font-medium text-emerald-500 text-sm">
            <CheckCircle className="size-4" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>
    </section>
  );
}
