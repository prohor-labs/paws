"use client";

import { type ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, User as UserIcon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { uploadFile } from "@/lib/api";

interface StepProfileProps {
  fullName: string;
  email: string;
  avatarUrl: string;
  onFullNameChange: (name: string) => void;
  onAvatarUrlChange: (url: string) => void;
}

export function StepProfile({
  fullName,
  email,
  avatarUrl,
  onFullNameChange,
  onAvatarUrlChange,
}: StepProfileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uploadPromise = uploadFile(file, "avatars")
      .then((uploaded) => {
        onAvatarUrlChange(uploaded.url);
        return uploaded;
      })
      .finally(() => {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      });

    toast.promise(uploadPromise, {
      loading: "ছবি আপলোড হচ্ছে...",
      success: "ছবি আপলোড সম্পন্ন হয়েছে!",
      error: (err) => (err instanceof Error ? err.message : "ছবি আপলোড করতে সমস্যা হয়েছে"),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="group relative flex size-16 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-border overflow-hidden bg-muted outline-none transition-colors hover:ring-2 hover:ring-primary/40 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed"
        >
          <Avatar className="size-full">
            <AvatarImage src={avatarUrl || undefined} alt={fullName} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
              {fullName?.[0] || <UserIcon size={20} />}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            {isUploading ? (
              <Spinner className="size-5 text-white" />
            ) : (
              <Camera size={16} className="text-white" />
            )}
          </div>
        </button>

        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-left text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            ছবি আপলোড করুন
          </button>
          <span className="text-xs text-muted-foreground">JPG, PNG বা WebP ফরম্যাট</span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <FieldGroup className="gap-4">
        <Field className="gap-1.5">
          <FieldLabel htmlFor="onboarding-name" className="text-xs font-semibold text-foreground">
            আপনার পূর্ণ নাম
          </FieldLabel>
          <Input
            id="onboarding-name"
            type="text"
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            placeholder="আপনার নাম লিখুন"
            required
            className="h-10 rounded-xl px-3 text-sm text-foreground bg-background"
          />
        </Field>

        <Field className="gap-1.5">
          <FieldLabel
            htmlFor="onboarding-email"
            className="text-xs font-semibold text-muted-foreground"
          >
            ইমেইল অ্যাড্রেস
          </FieldLabel>
          <Input
            id="onboarding-email"
            type="email"
            value={email}
            disabled
            className="h-10 rounded-xl px-3 text-sm bg-muted/40 border-border/60 cursor-not-allowed text-muted-foreground opacity-80"
          />
          <FieldDescription className="text-xs text-muted-foreground">
            আপনার অ্যাকাউন্টের সাথে যুক্ত প্রধান ইমেইল
          </FieldDescription>
        </Field>
      </FieldGroup>
    </div>
  );
}
