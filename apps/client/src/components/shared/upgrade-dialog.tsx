"use client";

import { Check, Sparkle } from "@/components/icons";
import { ResponsiveDialog } from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

export interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

export function UpgradeDialog({
  open,
  onOpenChange,
  className,
}: UpgradeDialogProps) {
  const { data: session } = useSession();
  const user = session?.user;

  const defaultMessage = user
    ? `হ্যালো, আমার আরও AI ক্রেডিট প্রয়োজন।\nআমার নাম: ${user.name || "শিক্ষার্থী"}\nইমেইল: ${user.email || ""}`
    : "হ্যালো, আমার আরও AI ক্রেডিট প্রয়োজন।";

  const telegramUrl = `https://t.me/pawfessor?text=${encodeURIComponent(defaultMessage)}`;

  const handleOpenTelegram = () => {
    window.open(telegramUrl, "_blank", "noopener,noreferrer");
    onOpenChange(false);
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      className={cn("sm:max-w-md", className)}
    >
      <div className="flex flex-col gap-5 py-2">
        <div className="flex flex-col items-center text-center gap-2 pt-2">
          <div className="size-12 rounded-2xl bg-gradient-to-tr from-teal-500/10 via-primary/10 to-indigo-500/10 text-primary flex items-center justify-center border border-primary/20 shadow-xs">
            <Sparkle className="size-6 text-primary animate-pulse" />
          </div>

          <div className="flex flex-col gap-1 mt-1">
            <h3 className="text-xl font-bold tracking-tight text-foreground">
              আরও AI ক্রেডিট চাই?
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              যেকোনো প্রশ্নের নির্ভুল স্টেপ-বাই-স্টেপ সমাধান ও মেন্টরিং ব্যাখ্যার জন্য সহজেই ক্রেডিট যুক্ত করে নাও।
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 flex flex-col gap-2.5">
          <span className="text-[11px] font-semibold text-muted-foreground tracking-wide">
            AI ক্রেডিট সুবিধার মধ্যে রয়েছে:
          </span>
          <ul className="flex flex-col gap-2">
            <li className="flex items-start gap-2.5 text-xs text-foreground/90">
              <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-2.5 stroke-[3]" />
              </span>
              <span className="font-medium text-foreground">
                যেকোনো জটিল প্রশ্নের ইনস্ট্যান্ট AI স্টেপ-বাই-স্টেপ সমাধান
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-xs text-foreground/90">
              <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-2.5 stroke-[3]" />
              </span>
              <span>ভুল অপশন কেন ভুল তার ডিপ কনসেপ্ট ও ফাঁদ বিশ্লেষণ</span>
            </li>
            <li className="flex items-start gap-2.5 text-xs text-foreground/90">
              <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-2.5 stroke-[3]" />
              </span>
              <span>এডমিশন ও পরীক্ষার হলে মনে রাখার স্পেশাল শর্টকাট টেকনিক</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <Button
            size="lg"
            className="w-full font-semibold shadow-sm bg-gradient-to-r from-teal-500 to-indigo-600 text-white hover:opacity-95 cursor-pointer flex items-center justify-center gap-2"
            onClick={handleOpenTelegram}
          >
            <span>মেসেজ দাও Telegram এ (@pawfessor)</span>
          </Button>

          <p className="text-[11px] text-muted-foreground text-center">
            টেলিগ্রামে মেসেজ দিলে দ্রুত তোমার একাউন্টে ক্রেডিট যুক্ত করে দেওয়া হবে।
          </p>
        </div>
      </div>
    </ResponsiveDialog>
  );
}

export default UpgradeDialog;
