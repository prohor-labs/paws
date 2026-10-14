"use client";

import * as React from "react";
import { Check, Sparkle } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useBillingStatus } from "@/hooks/use-billing";
import { useSession } from "@/lib/auth";
import { toBengaliNumber } from "@/lib/utils";

export function UpgradeView() {
  const { data: session } = useSession();
  const { data: billingStatus } = useBillingStatus();
  const user = session?.user;
  const currentCredits = billingStatus?.credits?.aiCredits ?? 0;

  const defaultMessage = user
    ? `হ্যালো, আমার আরও AI ক্রেডিট প্রয়োজন।\nআমার নাম: ${user.name || "শিক্ষার্থী"}\nইমেইল: ${user.email || ""}`
    : "হ্যালো, আমার আরও AI ক্রেডিট প্রয়োজন।";

  const telegramUrl = `https://t.me/pawfessor?text=${encodeURIComponent(defaultMessage)}`;

  const handleOpenTelegram = () => {
    window.open(telegramUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full min-h-[85vh] py-8 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center gap-6">
        <div className="size-16 sm:size-20 rounded-3xl bg-gradient-to-tr from-teal-500/10 via-primary/10 to-indigo-500/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm">
          <Sparkle className="size-8 sm:size-10 text-primary animate-pulse" />
        </div>

        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold self-center">
            <span>বর্তমানে এআই ক্রেডিট বাকি: {toBengaliNumber(currentCredits)}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            আরও AI ক্রেডিট চাই?
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            যেকোনো জটিল প্রশ্নের ইনস্ট্যান্ট স্টেপ-বাই-স্টেপ ব্যাখ্যা, ভুল অপশন বিশ্লেষণ ও শর্টকাট পেতে সরাসরি মেসেজ দিয়ে ক্রেডিট যুক্ত করে নিন।
          </p>
        </div>

        <div className="w-full rounded-2xl border border-border/80 bg-card p-5 sm:p-6 text-left flex flex-col gap-3 shadow-xs">
          <span className="text-xs font-bold text-foreground">
            AI ক্রেডিট দিয়ে যা যা করতে পারবেন:
          </span>
          <ul className="flex flex-col gap-2.5">
            <li className="flex items-start gap-2.5 text-xs text-foreground/90">
              <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-2.5 stroke-[3]" />
              </span>
              <span>
                <strong>ইনস্ট্যান্ট সমাধান:</strong> যেকোনো কঠিন প্রশ্নের নির্ভুল স্টেপ-বাই-স্টেপ সমাধান তৈরি করা।
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-xs text-foreground/90">
              <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-2.5 stroke-[3]" />
              </span>
              <span>
                <strong>ডিপ অপশন অ্যানালাইসিস:</strong> বাকি অপশনগুলো কেন ভুল এবং পরীক্ষার ট্র্যাপ কোথায় তা জানা।
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-xs text-foreground/90">
              <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-2.5 stroke-[3]" />
              </span>
              <span>
                <strong>এডমিশন শর্টকাট:</strong> পরীক্ষার হলে দ্রুত সঠিক উত্তর বের করার মানসিক কৌশল ও টেকনিক।
              </span>
            </li>
          </ul>
        </div>

        <div className="w-full flex flex-col gap-2.5">
          <Button
            size="lg"
            onClick={handleOpenTelegram}
            className="w-full py-6 font-bold text-sm sm:text-base cursor-pointer bg-gradient-to-r from-teal-500 via-indigo-600 to-indigo-700 text-white shadow-md hover:opacity-95 flex items-center justify-center gap-2"
          >
            <span>মেসেজ দাও Telegram এ (@pawfessor)</span>
          </Button>
          <p className="text-xs text-muted-foreground">
            টেলিগ্রামে মেসেজ দিলে সাথে সাথে যাচাই করে আপনার অ্যাকাউন্টে ক্রেডিট যুক্ত করে দেওয়া হবে।
          </p>
        </div>
      </div>
    </div>
  );
}

export default UpgradeView;
