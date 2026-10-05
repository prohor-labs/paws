"use client";

import Image from "next/image";
import * as React from "react";
import { toast } from "sonner";
import { Check, Copy, Share } from "@/components/icons";
import { ResponsiveDialog } from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { copyToClipboard } from "@/lib/clipboard";

export interface ShareDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  url: string;
  shareTitle?: string;
  shareText?: string;
}

const SHARE_PROVIDERS = [
  {
    name: "হোয়াটসঅ্যাপ",
    iconSrc: "/svgs/whatsapp.svg",
    getUrl: (url: string, text: string) => `https://api.whatsapp.com/send?text=${text}%20${url}`,
    bg: "hover:bg-emerald-500/10 hover:border-emerald-500/30",
  },
  {
    name: "ফেসবুক",
    iconSrc: "/svgs/facebook.svg",
    getUrl: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    bg: "hover:bg-blue-500/10 hover:border-blue-500/30",
  },
  {
    name: "টেলিগ্রাম",
    iconSrc: "/svgs/telegram.svg",
    getUrl: (url: string, text: string) => `https://t.me/share/url?url=${url}&text=${text}`,
    bg: "hover:bg-sky-500/10 hover:border-sky-500/30",
  },
  {
    name: "এক্স",
    iconSrc: "/svgs/x.svg",
    getUrl: (url: string, text: string) => `https://x.com/intent/tweet?url=${url}&text=${text}`,
    bg: "hover:bg-muted/80 hover:border-border",
  },
  {
    name: "লিংকডইন",
    iconSrc: "/svgs/linkedin.svg",
    getUrl: (url: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    bg: "hover:bg-blue-600/10 hover:border-blue-600/30",
  },
];

export function ShareDialog({
  open,
  onOpenChange,
  trigger,
  title = "শেয়ার করুন",
  description = "লিংক কপি করে অথবা সোশ্যাল মিডিয়ায় শেয়ার করুন",
  url,
  shareTitle = "Paws Academy",
  shareText,
}: ShareDialogProps) {
  const [copied, setCopied] = React.useState(false);
  const [fullUrl, setFullUrl] = React.useState(url);
  const [canNativeShare, setCanNativeShare] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      let resolvedUrl = url;
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        const cleanUrl = url.startsWith("/") ? url : `/${url}`;
        resolvedUrl = `${window.location.origin}${cleanUrl}`;
      }
      setFullUrl(resolvedUrl);

      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        setCanNativeShare(true);
      }
    }
  }, [url]);

  const handleCopy = async () => {
    const success = await copyToClipboard(fullUrl);
    if (success) {
      setCopied(true);
      toast.success("লিংক ক্লিপবোর্ডে কপি করা হয়েছে!");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("লিংক কপি করতে ব্যর্থ হয়েছে");
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText || shareTitle,
          url: fullUrl,
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Native share error:", err);
        }
      }
    }
  };

  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedText = encodeURIComponent(shareText || shareTitle || "");

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      title={title}
      description={description}
      className="sm:max-w-md"
    >
      <div className="flex flex-col gap-4 py-2">
        <div className="grid grid-cols-5 gap-2.5">
          {SHARE_PROVIDERS.map((provider) => (
            <a
              key={provider.name}
              href={provider.getUrl(encodedUrl, encodedText)}
              target="_blank"
              rel="noopener noreferrer"
              title={provider.name}
              aria-label={provider.name}
              className={`flex h-12 items-center justify-center rounded-xl border border-border/70 bg-card transition-colors duration-200 cursor-pointer ${provider.bg}`}
            >
              <Image
                src={provider.iconSrc}
                alt={provider.name}
                width={22}
                height={22}
                className="size-5 shrink-0"
                unoptimized
              />
            </a>
          ))}
        </div>

        {canNativeShare && (
          <Button
            type="button"
            variant="secondary"
            className="w-full gap-2 text-sm font-medium"
            onClick={handleNativeShare}
          >
            <Share size={16} />
            <span>ডিভাইস অ্যাপসে শেয়ার করুন</span>
          </Button>
        )}

        <div className="flex flex-col gap-1.5 pt-1">
          <label htmlFor="share-url-input" className="text-xs font-medium text-muted-foreground">
            লিংক কপি করুন
          </label>
          <div className="flex items-center gap-2">
            <Input
              id="share-url-input"
              readOnly
              value={fullUrl}
              onFocus={(e) => e.target.select()}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="text-xs font-mono select-all bg-muted/40 h-9"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="shrink-0 h-9 px-3 gap-1.5"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? "কপি হয়েছে" : "কপি"}</span>
            </Button>
          </div>
        </div>
      </div>
    </ResponsiveDialog>
  );
}
