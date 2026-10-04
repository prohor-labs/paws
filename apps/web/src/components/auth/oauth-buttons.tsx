"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { OAUTH_PROVIDERS } from "@/lib/consts/auth";

interface OAuthButtonsProps {
  isLoading: boolean;
  isGoogleLoading: boolean;
  onGoogleSignIn: () => void;
}

export function OAuthButtons({ isLoading, isGoogleLoading, onGoogleSignIn }: OAuthButtonsProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {OAUTH_PROVIDERS.map((provider) => (
        <Button
          key={provider.id}
          type="button"
          variant="outline"
          className="h-10 w-full justify-center gap-3 px-4 font-normal border-border/80"
          disabled={isLoading || isGoogleLoading}
          onClick={onGoogleSignIn}
        >
          <span className="flex shrink-0 items-center justify-center">
            {isGoogleLoading ? (
              <Spinner className="size-4" />
            ) : (
              <Image
                src={provider.iconSrc}
                alt={provider.label}
                width={16}
                height={16}
                className="size-4 shrink-0"
              />
            )}
          </span>
          <span
            className="inline-block h-4 w-px bg-border shrink-0 self-center"
            aria-hidden="true"
          />
          <span>{provider.label}</span>
        </Button>
      ))}
    </div>
  );
}
