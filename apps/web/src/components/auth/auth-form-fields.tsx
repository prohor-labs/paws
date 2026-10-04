"use client";

import type { FormEvent } from "react";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthMethodToggle } from "./auth-method-toggle";
import { AuthSubmitButton } from "./auth-submit-button";

interface AuthFormFieldsProps {
  mode: "signin" | "signup";
  method: "magic-link" | "password";
  name: string;
  email: string;
  password: string;
  isLoading: boolean;
  isGoogleLoading: boolean;
  onNameChange: (val: string) => void;
  onEmailChange: (val: string) => void;
  onPasswordChange: (val: string) => void;
  onMethodChange: (val: "magic-link" | "password") => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export function AuthFormFields({
  mode,
  method,
  name,
  email,
  password,
  isLoading,
  isGoogleLoading,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onMethodChange,
  onSubmit,
}: AuthFormFieldsProps) {
  const isBusy = isLoading || isGoogleLoading;
  const showPasswordField = mode === "signup" || (mode === "signin" && method === "password");

  return (
    <form className="flex flex-col gap-3.5" onSubmit={onSubmit}>
      <FieldGroup className="gap-3">
        {mode === "signup" ? (
          <Field className="gap-1.5">
            <Input
              id="auth-name"
              type="text"
              aria-label="পুরো নাম"
              autoComplete="name"
              placeholder="আপনার পুরো নাম"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              disabled={isBusy}
              className="h-10 bg-background/90 border-border/70"
              required
            />
          </Field>
        ) : null}

        <Field className="gap-1.5">
          <Input
            id="auth-email"
            type="email"
            aria-label="ইমেইল অ্যাড্রেস"
            autoComplete="email"
            placeholder="ইমেইল অ্যাড্রেস (you@gmail.com)"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            disabled={isBusy}
            className="h-10 bg-background/90 border-border/70"
            required
          />
        </Field>

        {showPasswordField ? (
          <Field className="gap-1.5">
            <Input
              id="auth-password"
              type="password"
              aria-label="পাসওয়ার্ড"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              placeholder="পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              disabled={isBusy}
              className="h-10 bg-background/90 border-border/70"
              required
              minLength={8}
            />
          </Field>
        ) : null}
      </FieldGroup>

      <AuthSubmitButton mode={mode} method={method} isLoading={isLoading} disabled={isBusy} />

      {mode === "signin" ? (
        <AuthMethodToggle method={method} onMethodChange={onMethodChange} />
      ) : null}
    </form>
  );
}
