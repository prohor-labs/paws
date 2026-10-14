"use client";

import * as React from "react";
import { Check } from "@/components/icons";
import { ResponsiveDialog } from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

interface CreditPackage {
  id: string;
  credits: number;
  creditsLabel: string;
  price: number;
  badge?: string;
  popular?: boolean;
}

const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "1000",
    credits: 1000,
    creditsLabel: "১,০০০ ক্রেডিট",
    price: 49,
    badge: "স্টার্টার",
  },
  {
    id: "3000",
    credits: 3000,
    creditsLabel: "৩,০০০ ক্রেডিট",
    price: 129,
    badge: "জনপ্রিয়",
    popular: true,
  },
  {
    id: "10000",
    credits: 10000,
    creditsLabel: "১০,০০০ ক্রেডিট",
    price: 399,
    badge: "বেস্ট ভ্যালু",
  },
];

export function UpgradeDialog({
  open,
  onOpenChange,
  className,
}: UpgradeDialogProps) {
  const [selectedPackage, setSelectedPackage] = React.useState<CreditPackage>(CREDIT_PACKAGES[1]!);

  const defaultMessage = `হ্যালো, আমি Pawfessor এ ${selectedPackage.creditsLabel} (৳${selectedPackage.price}) নিতে চাই।`;

  const telegramUrl = `https://t.me/pawfessor?text=${encodeURIComponent(defaultMessage)}`;

  const handleOpenTelegram = () => {
    window.open(telegramUrl, "_blank", "noopener,noreferrer");
    onOpenChange(false);
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      className={cn("sm:max-w-lg", className)}
    >
      <div className="flex flex-col gap-4 py-1">
        <div className="flex flex-col items-center text-center gap-1 pt-1">
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            আরও AI ক্রেডিট চাই?
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
            প্যাকেজ সিলেক্ট করে টেলিগ্রামে মেসেজ দাও, সাথে সাথেই ক্রেডিট যুক্ত করে দেওয়া হবে।
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {CREDIT_PACKAGES.map((pkg) => {
            const isSelected = selectedPackage.id === pkg.id;
            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => setSelectedPackage(pkg)}
                className={cn(
                  "relative flex flex-col items-center justify-between p-3 rounded-2xl border text-center transition-all cursor-pointer",
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                    : "border-border/70 bg-card hover:border-primary/40 hover:bg-muted/30",
                )}
              >
                {pkg.badge && (
                  <span
                    className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded-full mb-1 uppercase tracking-wider",
                      pkg.popular
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {pkg.badge}
                  </span>
                )}
                <span className="text-xs font-bold text-foreground">
                  {pkg.creditsLabel}
                </span>
                <span className="mt-1 text-base font-extrabold text-primary">
                  ৳{pkg.price}
                </span>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-border/70 bg-muted/30 p-3 flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground">
            ক্রেডিট সুবিধাসমূহ:
          </span>
          <ul className="flex flex-col gap-1.5">
            <li className="flex items-center gap-2 text-xs text-foreground/90">
              <span className="flex size-3.5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-2 stroke-[3]" />
              </span>
              <span>যেকোনো জটিল প্রশ্নের ইনস্ট্যান্ট AI স্টেপ-বাই-স্টেপ সমাধান</span>
            </li>
            <li className="flex items-center gap-2 text-xs text-foreground/90">
              <span className="flex size-3.5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-2 stroke-[3]" />
              </span>
              <span>এডমিশন ও পরীক্ষার হলে মনে রাখার স্পেশাল শর্টকাট টেকনিক</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-center">
          <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            ⚠️ AI Credits সম্পূর্ণ অফেরতযোগ্য (Non-refundable)।
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-0.5">
          <Button
            size="lg"
            className="w-full h-11 text-sm font-bold shadow-md bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-600 hover:brightness-105 active:scale-[0.99] text-white cursor-pointer flex items-center justify-center gap-2 transition-all rounded-xl"
            onClick={handleOpenTelegram}
          >
            <span>Click করে মেসেজ দাও (৳{selectedPackage.price})</span>
            <span className="text-base font-bold">→</span>
          </Button>

          <p className="text-[11px] text-muted-foreground text-center">
            মেসেজ পাঠালে @pawfessor টিম দ্রুত ক্রেডিট সক্রিয় করে দেবে।
          </p>
        </div>
      </div>
    </ResponsiveDialog>
  );
}

export default UpgradeDialog;
