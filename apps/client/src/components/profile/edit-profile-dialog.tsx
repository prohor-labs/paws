"use client";

import * as React from "react";
import { ResponsiveDialog } from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateUser } from "@/lib/auth";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onSuccess?: () => void;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  currentName,
  onSuccess,
}: EditProfileDialogProps) {
  const [name, setName] = React.useState(currentName);
  const [isPending, setIsPending] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

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
    })
      .then(() => {
        onSuccess?.();
        onOpenChange(false);
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
          setErrorMsg("");
        }
        onOpenChange(nextOpen);
      }}
      title="ব্যক্তিগত তথ্য পরিবর্তন"
      description="আপনার পুরো নাম আপডেট করুন।"
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
