"use client";

import * as React from "react";
import { Award, Camera, Fire, Trophy } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { uploadFile } from "@/lib/api";
import { updateUser, useSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function ProfileCard() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const user = session?.user;

  const handleAvatarClick = () => {
    if (isSessionLoading || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);

    uploadFile(file, "profiles")
      .then(async (res) => {
        if (res?.url) {
          await updateUser({ image: res.url });
        }
      })
      .catch(() => {
        alert("ছবি আপলোড করতে সমস্যা হয়েছে।");
      })
      .finally(() => {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      });
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "P";

  return (
    <div className="flex flex-col items-center gap-1 bg-card shadow-xs p-5 sm:p-6 rounded-2xl w-full border border-border/80 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-primary/10 to-transparent" />

      <button
        type="button"
        className={cn(
          "relative z-10 group border-none p-0 bg-transparent text-left mt-2",
          !isSessionLoading && "cursor-pointer",
        )}
        onClick={handleAvatarClick}
      >
        {isSessionLoading ? (
          <div className="size-20 sm:size-24 rounded-full bg-muted animate-pulse border-4 border-card" />
        ) : (
          <Avatar className="size-20 sm:size-24 border-4 border-card shadow-md transition-transform active:scale-95">
            <AvatarImage src={user?.image || undefined} alt={user?.name || "ব্যবহারকারী"} />
            <AvatarFallback className="font-bold text-base bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        )}

        {!isSessionLoading && (
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {isUploading ? (
              <Spinner className="size-6 text-white" />
            ) : (
              <Camera className="size-6 text-white" />
            )}
          </div>
        )}
      </button>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading || isSessionLoading}
      />

      <div className="flex flex-col items-center gap-1 mt-3 text-center z-10 w-full">
        {isSessionLoading ? (
          <>
            <div className="h-5 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-24 bg-muted rounded animate-pulse mt-1" />
          </>
        ) : (
          <>
            <h3 className="font-bold text-base sm:text-lg text-foreground leading-tight">
              {user?.name || "ব্যবহারকারী"}
            </h3>
            <p className="text-muted-foreground text-xs font-medium">
              {user?.email || "student@pawfessor.academy"}
            </p>



            <div className="flex items-center gap-2 mt-3">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <div className="size-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20 cursor-default" />
                  }
                >
                  <Trophy className="size-4" />
                </TooltipTrigger>
                <TooltipContent side="top">শীর্ষ স্কোরার</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <div className="size-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 border border-orange-500/20 cursor-default" />
                  }
                >
                  <Fire className="size-4" />
                </TooltipTrigger>
                <TooltipContent side="top">স্ট্রিক</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 cursor-default" />
                  }
                >
                  <Award className="size-4" />
                </TooltipTrigger>
                <TooltipContent side="top">অ্যাক্টিভ শিক্ষার্থী</TooltipContent>
              </Tooltip>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
