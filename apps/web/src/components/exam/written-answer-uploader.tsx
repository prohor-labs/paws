"use client";

import Image from "next/image";
import * as React from "react";
import { toast } from "sonner";
import { Camera, Eye, FileCheck, Loader, Plus, X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { uploadFile } from "@/lib/sdk";
import { cn, toBengaliNumber } from "@/lib/utils";

export interface WrittenPageItem {
  pageNumber: number;
  imageUrl: string;
}

export interface EvaluatedScriptItem {
  id: string;
  pageNumber: number;
  imageUrl: string;
  annotatedImageUrl?: string | null;
  marksAwarded?: string | null;
  maxMarks?: number | null;
  feedback?: string | null;
}

interface WrittenAnswerUploaderProps {
  questionId: string;
  writtenPages?: WrittenPageItem[];
  onWrittenPagesChange?: (pages: WrittenPageItem[]) => void;
  evaluatedScripts?: EvaluatedScriptItem[];
  interactiveMode?: "practice" | "live_exam" | "view";
  disabled?: boolean;
}

export function WrittenAnswerUploader({
  questionId,
  writtenPages = [],
  onWrittenPagesChange,
  evaluatedScripts = [],
  interactiveMode = "live_exam",
  disabled = false,
}: WrittenAnswerUploaderProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [previewImageUrl, setPreviewImageUrl] = React.useState<string | null>(null);
  const [previewPageNum, setPreviewPageNum] = React.useState<number>(1);

  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const galleryInputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || !onWrittenPagesChange) return;

    setIsUploading(true);
    const newPages: WrittenPageItem[] = [...writtenPages];

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (!file.type.startsWith("image/")) {
          toast.error("শুধুমাত্র ছবি আপলোড করা যাবে");
          continue;
        }

        const uploaded = await uploadFile(file, "written-answers");
        if (uploaded?.url) {
          const nextPageNum = newPages.length + 1;
          newPages.push({
            pageNumber: nextPageNum,
            imageUrl: uploaded.url,
          });
        }
      }

      onWrittenPagesChange(newPages);
      toast.success("উত্তরের ছবি সফলভাবে আপলোড হয়েছে!");
    } catch (err) {
      console.error("Failed to upload image:", err);
      toast.error("ছবি আপলোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setIsUploading(false);
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const handleRemovePage = (indexToRemove: number) => {
    if (!onWrittenPagesChange) return;
    const updated = writtenPages
      .filter((_, idx) => idx !== indexToRemove)
      .map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    onWrittenPagesChange(updated);
    toast.info("পৃষ্ঠা সরানো হয়েছে");
  };

  const isLiveExam = interactiveMode === "live_exam";
  const displayPages: Array<{
    pageNumber: number;
    imageUrl: string;
    marksAwarded?: string | null;
    maxMarks?: number | null;
    feedback?: string | null;
  }> =
    evaluatedScripts.length > 0
      ? evaluatedScripts.map((s) => ({
          pageNumber: s.pageNumber,
          imageUrl: s.annotatedImageUrl || s.imageUrl,
          marksAwarded: s.marksAwarded,
          maxMarks: s.maxMarks,
          feedback: s.feedback,
        }))
      : writtenPages;

  return (
    <div className="flex flex-col gap-3 pt-3 border-t border-border/60">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground">
          <FileCheck className="size-4 text-primary" />
          <span>লিখিত উত্তরের খাতা / ছবি</span>
          {displayPages.length > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {toBengaliNumber(displayPages.length)} টি পৃষ্ঠা
            </span>
          )}
        </div>

        {isLiveExam && !disabled && displayPages.length > 0 && (
          <div className="flex items-center gap-1.5">
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
              disabled={isUploading}
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
              disabled={isUploading}
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isUploading}
              className="h-8 px-2.5 text-xs font-semibold rounded-lg gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
            >
              <Camera className="size-3.5" />
              <span>ছবি তুলুন</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => galleryInputRef.current?.click()}
              disabled={isUploading}
              className="h-8 px-2.5 text-xs font-semibold rounded-lg gap-1.5"
            >
              <Plus className="size-3.5" />
              <span>আপলোড</span>
            </Button>
          </div>
        )}
      </div>

      {/* Hidden inputs when empty */}
      {isLiveExam && !disabled && displayPages.length === 0 && (
        <>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={isUploading}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={isUploading}
          />
        </>
      )}

      {isUploading && (
        <div className="flex items-center justify-center gap-2.5 p-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 text-primary text-xs font-medium animate-pulse">
          <Loader className="size-4 animate-spin" />
          <span>ছবি আপলোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</span>
        </div>
      )}

      {displayPages.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {displayPages.map((page, pIdx) => (
            <div
              key={`${page.pageNumber}-${pIdx}`}
              className="group relative flex flex-col rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200"
            >
              <div className="relative aspect-3/4 min-h-[180px] sm:min-h-[220px] md:min-h-[260px] w-full bg-muted/40 cursor-pointer overflow-hidden">
                <Image
                  src={page.imageUrl}
                  alt={`পৃষ্ঠা ${toBengaliNumber(page.pageNumber)}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  onClick={() => {
                    setPreviewImageUrl(page.imageUrl);
                    setPreviewPageNum(page.pageNumber);
                  }}
                />

                <div
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                  onClick={() => {
                    setPreviewImageUrl(page.imageUrl);
                    setPreviewPageNum(page.pageNumber);
                  }}
                >
                  <span className="flex items-center gap-1.5 text-xs font-bold text-white bg-black/70 px-3 py-1.5 rounded-lg backdrop-blur-xs">
                    <Eye className="size-4" />
                    <span>বড় করে দেখুন</span>
                  </span>
                </div>

                {isLiveExam && !disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePage(pIdx);
                    }}
                    aria-label="পৃষ্ঠা মুছুন"
                    className="absolute top-2 right-2 z-10 size-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md opacity-90 hover:opacity-100 hover:scale-110 transition-all cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              <div className="p-2.5 flex items-center justify-between text-xs font-medium border-t border-border/50 bg-card">
                <span className="text-foreground font-bold">
                  পৃষ্ঠা {toBengaliNumber(page.pageNumber)}
                </span>
                {Boolean(page.marksAwarded) && (
                  <span className="text-primary font-semibold">
                    নম্বর: {toBengaliNumber(page.marksAwarded)}
                    {page.maxMarks ? ` / ${toBengaliNumber(page.maxMarks)}` : ""}
                  </span>
                )}
              </div>

              {Boolean(page.feedback) && (
                <div className="px-2.5 pb-2.5 text-xs text-muted-foreground bg-card">
                  মন্তব্য: {page.feedback}
                </div>
              )}
            </div>
          ))}

          {isLiveExam && !disabled && (
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={isUploading}
              className="flex flex-col items-center justify-center gap-2.5 min-h-[180px] sm:min-h-[220px] md:min-h-[260px] rounded-2xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/10 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all cursor-pointer p-4 text-center group"
            >
              <div className="size-10 sm:size-12 rounded-2xl bg-muted/80 group-hover:bg-primary/10 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                <Plus className="size-5 sm:size-6" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary">
                  আরো পৃষ্ঠা যোগ করুন
                </span>
                <span className="text-[11px] text-muted-foreground">
                  পৃষ্ঠা {toBengaliNumber(displayPages.length + 1)}
                </span>
              </div>
            </button>
          )}
        </div>
      ) : (
        !isUploading && (
          <div
            onClick={() => {
              if (isLiveExam && !disabled) {
                galleryInputRef.current?.click();
              }
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-3 p-6 sm:p-8 md:p-10 min-h-[150px] sm:min-h-[190px] md:min-h-[230px] rounded-2xl border-2 border-dashed border-border/80 bg-muted/15 text-center transition-all duration-200",
              isLiveExam && !disabled && "cursor-pointer hover:border-primary/50 hover:bg-primary/5",
            )}
          >
            <div className="size-11 sm:size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-2xs">
              <Camera className="size-6 sm:size-7" />
            </div>
            <div className="flex flex-col items-center gap-1 max-w-md">
              <span className="text-sm sm:text-base font-bold text-foreground">
                {isLiveExam
                  ? "খাতায় উত্তর লিখে ছবি তুলুন অথবা আপলোড করুন"
                  : "কোনো লিখিত উত্তরের খাতা আপলোড করা হয়নি"}
              </span>
              {isLiveExam && (
                <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  মোবাইল দিয়ে সরাসরি পেছনের ক্যামেরায় ছবি তুলুন অথবা গ্যালারি / ফাইল থেকে এক বা একাধিক পৃষ্ঠা আপলোড করুন
                </span>
              )}
            </div>

            {isLiveExam && !disabled && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    cameraInputRef.current?.click();
                  }}
                  className="h-9 px-4 text-xs sm:text-sm font-semibold rounded-xl gap-2 border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
                >
                  <Camera className="size-4" />
                  <span>ক্যামেরা দিয়ে ছবি তুলুন</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    galleryInputRef.current?.click();
                  }}
                  className="h-9 px-4 text-xs sm:text-sm font-semibold rounded-xl gap-2 cursor-pointer shadow-xs"
                >
                  <Plus className="size-4" />
                  <span>গ্যালারি / ফাইল আপলোড</span>
                </Button>
              </div>
            )}
          </div>
        )
      )}

      {/* Full Image Preview Modal */}
      <Dialog
        open={Boolean(previewImageUrl)}
        onOpenChange={(open) => !open && setPreviewImageUrl(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] p-4 flex flex-col gap-3">
          <DialogHeader>
            <DialogTitle className="text-sm sm:text-base font-bold">
              পৃষ্ঠা {toBengaliNumber(previewPageNum)} - উত্তরের খাতা প্রিভিউ
            </DialogTitle>
            <DialogDescription className="sr-only">
              লিখিত উত্তরের খাতার সম্পূর্ণ ছবি
            </DialogDescription>
          </DialogHeader>
          <div className="relative w-full h-[65vh] rounded-lg overflow-hidden bg-black/10">
            {previewImageUrl && (
              <Image
                src={previewImageUrl}
                alt={`পৃষ্ঠা ${toBengaliNumber(previewPageNum)}`}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-contain"
                priority
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
