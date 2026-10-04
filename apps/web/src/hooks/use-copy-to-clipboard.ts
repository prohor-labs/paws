"use client";

import { useEffect, useRef, useState } from "react";
import { copyToClipboard as universalCopy } from "@/lib/clipboard";

export type UseCopyToClipboardOptions = {
  copiedDuration?: number;
};

export const useCopyToClipboard = ({ copiedDuration = 3000 }: UseCopyToClipboardOptions = {}) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scopeGenerationRef = useRef(0);

  useEffect(
    () => () => {
      scopeGenerationRef.current += 1;
      if (copiedTimerRef.current === undefined) return;

      clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = undefined;
      setIsCopied(false);
    },
    [],
  );

  const copyToClipboard = async (value: string) => {
    if (!value || typeof window === "undefined") {
      return;
    }

    const scopeGeneration = scopeGenerationRef.current;
    const success = await universalCopy(value);

    if (success) {
      if (scopeGeneration !== scopeGenerationRef.current) return;
      if (copiedTimerRef.current !== undefined) {
        clearTimeout(copiedTimerRef.current);
      }
      setIsCopied(true);
      copiedTimerRef.current = setTimeout(() => {
        copiedTimerRef.current = undefined;
        setIsCopied(false);
      }, copiedDuration);
    }
  };

  return { isCopied, copyToClipboard };
};
