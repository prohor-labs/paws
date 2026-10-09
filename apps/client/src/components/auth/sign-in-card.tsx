"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { signIn, signUp, useSession } from "@/lib/auth";
import { AuthFormFields } from "./auth-form-fields";
import { AuthLogo } from "./auth-logo";
import { OAuthButtons } from "./oauth-buttons";

type AuthMode = "signin" | "signup";
type SignInMethod = "magic-link" | "password";

export function SignInCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams?.get("redirect");
  const redirectTarget = rawRedirect && rawRedirect !== "/" ? rawRedirect : "/dashboard";

  const { data: session, isPending: isSessionPending } = useSession();
  const user = session?.user as
    | (NonNullable<typeof session>["user"] & { onboardingCompleted?: boolean })
    | undefined;

  useEffect(() => {
    if (!isSessionPending && session) {
      const destination = user && !user.onboardingCompleted ? "/onboarding" : redirectTarget;
      router.replace(destination);
    }
  }, [session, user, isSessionPending, router, redirectTarget]);

  const [mode, setMode] = useState<AuthMode>("signin");
  const [method, setMethod] = useState<SignInMethod>("magic-link");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSignUp = () => {
    if (!name.trim()) {
      toast.error("আপনার পুরো নাম প্রদান করুন");
      return;
    }
    if (!password) {
      toast.error("পাসওয়ার্ড প্রদান করুন");
      return;
    }

    setIsLoading(true);
    signUp
      .email({ email, password, name })
      .then((res) => {
        if (res.error) {
          toast.error(res.error.message || "রেজিস্ট্রেশন করতে সমস্যা হয়েছে");
        } else {
          toast.success("রেজিস্ট্রেশন সফল হয়েছে!");
          router.push(redirectTarget);
          router.refresh();
        }
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "অনাকাঙ্ক্ষিত ত্রুটি দেখা দিয়েছে";
        toast.error(message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleMagicLinkSignIn = () => {
    setIsLoading(true);
    const callbackUrl = redirectTarget.startsWith("http")
      ? redirectTarget
      : `${window.location.origin}${redirectTarget.startsWith("/") ? redirectTarget : `/${redirectTarget}`}`;

    signIn
      .magicLink({
        email,
        callbackURL: callbackUrl,
      })
      .then((res) => {
        if (res.error) {
          toast.error(res.error.message || "ম্যাজিক লিংক পাঠাতে ব্যর্থ হয়েছে");
        } else {
          toast.success("আপনার ইমেইলে লগ ইন লিংক পাঠানো হয়েছে! ইনবক্স চেক করুন।");
        }
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "ম্যাজিক লিংক পাঠাতে সমস্যা হয়েছে";
        toast.error(message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handlePasswordSignIn = () => {
    if (!password) {
      toast.error("পাসওয়ার্ড প্রদান করুন");
      return;
    }

    setIsLoading(true);
    signIn
      .email({ email, password })
      .then((res) => {
        if (res.error) {
          toast.error(res.error.message || "ভুল ইমেইল বা পাসওয়ার্ড");
        } else {
          toast.success("লগ ইন সফল হয়েছে!");
          router.push(redirectTarget);
          router.refresh();
        }
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "লগ ইন করতে সমস্যা হয়েছে";
        toast.error(message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      toast.error("অনুগ্রহ করে ইমেইল প্রদান করুন");
      return;
    }

    if (mode === "signup") {
      handleSignUp();
    } else if (method === "magic-link") {
      handleMagicLinkSignIn();
    } else {
      handlePasswordSignIn();
    }
  };

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    const callbackUrl = redirectTarget.startsWith("http")
      ? redirectTarget
      : `${window.location.origin}${redirectTarget.startsWith("/") ? redirectTarget : `/${redirectTarget}`}`;

    signIn
      .social({
        provider: "google",
        callbackURL: callbackUrl,
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "গুগল দিয়ে লগ ইন করতে সমস্যা হয়েছে";
        toast.error(message);
      })
      .finally(() => {
        setIsGoogleLoading(false);
      });
  };

  return (
    <div className="flex flex-col gap-5 px-5 pt-7 pb-6 sm:gap-6 sm:px-10 sm:pt-9 sm:pb-8">
      <div className="flex flex-col items-center gap-4 text-center sm:gap-5">
        <AuthLogo />
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Paws Academy এ স্বাগতম
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "signup"
              ? "নতুন একাউন্ট তৈরি করতে তথ্য দিন"
              : method === "magic-link"
                ? "পাসওয়ার্ড ছাড়া ম্যাজিক লিংক দিয়ে সরাসরি লগ ইন করুন"
                : "আপনার পাসওয়ার্ড দিয়ে লগ ইন করুন"}
          </p>
        </div>
      </div>

      <AuthFormFields
        mode={mode}
        method={method}
        name={name}
        email={email}
        password={password}
        isLoading={isLoading}
        isGoogleLoading={isGoogleLoading}
        onNameChange={setName}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onMethodChange={setMethod}
        onSubmit={handleSubmit}
      />

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border/60" />
        <span className="text-xs text-muted-foreground">অথবা</span>
        <div className="h-px flex-1 bg-border/60" />
      </div>

      <OAuthButtons
        isLoading={isLoading}
        isGoogleLoading={isGoogleLoading}
        onGoogleSignIn={handleGoogleSignIn}
      />

      <p className="text-center text-sm text-muted-foreground">
        {mode === "signin" ? (
          <span>
            প্রথমবার এসেছেন?{" "}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors cursor-pointer"
            >
              সাইন আপ করুন
            </button>
          </span>
        ) : (
          <span>
            ইতোমধ্যে একাউন্ট আছে?{" "}
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors cursor-pointer"
            >
              লগ ইন করুন
            </button>
          </span>
        )}
      </p>
    </div>
  );
}
