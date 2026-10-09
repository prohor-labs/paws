"use client";

import { Check, Plus, ShieldCheck } from "@/components/icons";
import { ResponsiveDialog } from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PlanFeature {
  text: string;
  highlighted?: boolean;
}

export interface PlanAddon {
  name: string;
  description: string;
  price: string;
}

export interface UpgradePlan {
  id: string;
  name: string;
  badge?: string;
  price: string;
  period?: string;
  description: string;
  features: Array<string | PlanFeature>;
  addons?: PlanAddon[];
  ctaText?: string;
}

export const launchPlan: UpgradePlan = {
  id: "launch",
  name: "পাওজ প্রো",
  badge: "সবচেয়ে জনপ্রিয়",
  price: "৳৪৯৯",
  period: "/মাস",
  description: "সব প্রিমিয়াম এক্সাম ব্যাচ, আনলিমিটেড ব্যাখ্যা ও AI সুবিধার পূর্ণ অ্যাক্সেস।",
  features: [
    { text: "আনলিমিটেড মডেল টেস্ট এবং অধ্যায়ভিত্তিক প্র্যাকটিস", highlighted: true },
    { text: "সব প্রশ্নের আনলিমিটেড পূর্ণাঙ্গ ব্যাখ্যা ও সমাধান", highlighted: true },
    { text: "AI ডাউট সলভার ও ইনস্ট্যান্ট হিন্টস", highlighted: true },
    { text: "লাইভ লিডারবোর্ড ও বিস্তারিত পারফরম্যান্স অ্যানালিটিক্স" },
    { text: "লিখিত পরীক্ষার খাতা মূল্যায়ন ও নির্ভুল ফিডব্যাক" },
    { text: "নতুন সব প্রশ্নব্যাংক ও প্রিমিয়াম রিসোর্সে অগ্রাধিকার" },
  ],
  addons: [
    {
      name: "অতিরিক্ত AI ক্রেডিট (+১,০০০)",
      description: "মেয়াদহীন AI ডাউট সলভ ও এক্সপ্লেনেশন ক্রেডিট",
      price: "+৳১৯৯",
    },
  ],
  ctaText: "প্রো মেম্বারশিপে আপগ্রেড করুন",
};

export interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: UpgradePlan;
  onUpgrade?: () => void;
  isProcessing?: boolean;
  className?: string;
}

export function UpgradeDialog({
  open,
  onOpenChange,
  plan = launchPlan,
  onUpgrade,
  isProcessing = false,
  className,
}: UpgradeDialogProps) {
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      className={cn("sm:max-w-md", className)}
    >
      <div className="flex flex-col gap-5 py-1">
        <div className="flex flex-col items-center text-center gap-1.5 pt-2">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-extrabold text-foreground tracking-tight">
              {plan.price}
            </span>
            {plan.period && (
              <span className="text-xs font-medium text-muted-foreground">{plan.period}</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground max-w-xs">{plan.description}</p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 flex flex-col gap-2.5">
          <span className="text-[11px] font-semibold text-muted-foreground tracking-wide">
            প্রো মেম্বারশিপে যা যা পাচ্ছেন:
          </span>
          <ul className="flex flex-col gap-2">
            {plan.features.map((item) => {
              const text = typeof item === "string" ? item : item.text;
              const isHighlighted = typeof item === "object" && item.highlighted;

              return (
                <li key={text} className="flex items-start gap-2.5 text-xs text-foreground/90">
                  <span
                    className={cn(
                      "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full",
                      isHighlighted
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground border border-border",
                    )}
                  >
                    <Check className="size-2.5 stroke-[3]" />
                  </span>
                  <span className={cn(isHighlighted && "font-medium text-foreground")}>{text}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {plan.addons && plan.addons.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground tracking-wide flex items-center gap-1">
                <Plus className="size-3 text-primary" /> অতিরিক্ত অ্যাড-অনসমূহ
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {plan.addons.map((addon) => (
                <div
                  key={addon.name}
                  className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 px-3 py-2 text-xs"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{addon.name}</span>
                    <span className="text-[11px] text-muted-foreground">{addon.description}</span>
                  </div>
                  <span className="font-semibold text-xs text-foreground/80 shrink-0 ml-2">
                    {addon.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 pt-1">
          <Button
            size="lg"
            className="w-full font-semibold shadow-sm bg-gradient-to-r from-teal-500 to-indigo-600 text-white hover:opacity-95"
            onClick={onUpgrade || (() => (window.location.href = "/upgrade"))}
            isLoading={isProcessing}
          >
            {plan.ctaText || "প্রো মেম্বারশিপে আপগ্রেড করুন"}
          </Button>
          <p className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground text-center">
            <ShieldCheck className="size-3.5 text-muted-foreground/80" />
            যেকোনো সময় বাতিলযোগ্য • নিরাপদ ও সুরক্ষিত পেমেন্ট
          </p>
        </div>
      </div>
    </ResponsiveDialog>
  );
}

export default UpgradeDialog;
