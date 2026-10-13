"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as React from "react";
import { ResponsiveDialog } from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getAuthClient, updateUser } from "@/lib/auth";
import {
  type EducationalStandard,
  STANDARD_OPTIONS,
  STREAM_OPTIONS_BY_STANDARD,
} from "@/lib/consts/onboarding";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  currentStandard?: string | null;
  currentTrack?: string | null;
  onSuccess?: () => void;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  currentName,
  currentStandard,
  currentTrack,
  onSuccess,
}: EditProfileDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = React.useState(currentName);
  const [standard, setStandard] = React.useState<EducationalStandard>(
    (currentStandard as EducationalStandard) || "hsc",
  );
  const [track, setTrack] = React.useState<string>(currentTrack || "science");
  const [isPending, setIsPending] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  const streamOptions = STREAM_OPTIONS_BY_STANDARD[standard] ?? STREAM_OPTIONS_BY_STANDARD.hsc;

  const handleStandardChange = (newStd: EducationalStandard) => {
    setStandard(newStd);
    const availableStreams = STREAM_OPTIONS_BY_STANDARD[newStd];
    if (availableStreams && availableStreams.length > 0) {
      setTrack(availableStreams[0].id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("নাম খালি রাখা যাবে না");
      return;
    }

    setIsPending(true);
    setErrorMsg("");

    updateUser({
      name: name.trim(),
      level: standard,
      educationalStandard: standard,
      track: track,
    })
      .then(async () => {
        try {
          await getAuthClient().getSession();
        } catch {
          // ignore
        }
        queryClient.invalidateQueries();
        onSuccess?.();
        onOpenChange(false);
        router.refresh();
      })
      .catch(() => {
        setErrorMsg("প্রোফাইল আপডেট করতে সমস্যা হয়েছে।");
      })
      .finally(() => {
        setIsPending(false);
      });
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setName(currentName);
          setStandard((currentStandard as EducationalStandard) || "hsc");
          setTrack(currentTrack || "science");
          setErrorMsg("");
        }
        onOpenChange(nextOpen);
      }}
      title="ব্যক্তিগত তথ্য পরিবর্তন"
      description="আপনার পুরো নাম, শিক্ষাগত স্তর ও স্টাডি গ্রুপ আপডেট করুন।"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
        <Field className="gap-1.5">
          <FieldLabel htmlFor="edit-profile-name" className="text-xs font-bold text-foreground">
            পুরো নাম
          </FieldLabel>
          <Input
            id="edit-profile-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="আপনার পুরো নাম লিখুন"
            className="h-10 rounded-xl"
            required
          />
        </Field>

        <Field className="gap-1.5">
          <FieldLabel htmlFor="edit-profile-standard" className="text-xs font-bold text-foreground">
            শিক্ষাগত স্তর (Educational Standard)
          </FieldLabel>
          <select
            id="edit-profile-standard"
            value={standard}
            onChange={(e) => handleStandardChange(e.target.value as EducationalStandard)}
            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs sm:text-sm font-medium text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {STANDARD_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>

        <Field className="gap-1.5">
          <FieldLabel htmlFor="edit-profile-track" className="text-xs font-bold text-foreground">
            বিভাগ / স্টাডি ট্র্যাক (Group / Stream)
          </FieldLabel>
          <select
            id="edit-profile-track"
            value={track}
            onChange={(e) => setTrack(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs sm:text-sm font-medium text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {streamOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>

        {errorMsg && <p className="text-xs font-medium text-destructive">{errorMsg}</p>}

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 pt-2 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto h-11 sm:h-10 px-5 rounded-xl text-xs font-semibold cursor-pointer"
          >
            বাতিল
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            isLoading={isPending}
            className="w-full sm:w-auto h-11 sm:h-10 inline-flex items-center justify-center gap-1.5 px-6 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground transition-colors shadow-sm active:scale-95 cursor-pointer"
          >
            <span>সংরক্ষণ করুন</span>
          </Button>
        </div>
      </form>
    </ResponsiveDialog>
  );
}
