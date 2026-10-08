"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import {
  Award,
  BookOpen,
  Check,
  FileCheck,
  Plus,
  ShieldCheck,
  Sparkle,
  TriangleWarning,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBillingConfig, useCreateOrder, useValidateCoupon } from "@/hooks/use-billing";
import { cn, toBengaliNumber } from "@/lib/utils";

export interface UpgradeFeatureItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
}

export const UPGRADE_FEATURES: UpgradeFeatureItem[] = [
  {
    id: "question-bank",
    title: "বিগত বছরসমূহের প্রশ্ন ব্যাংক",
    subtitle: "১০ লক্ষ+ প্রশ্ন ও নির্ভুল ব্যাখ্যা ডাটাবেজ",
    icon: BookOpen,
  },
  {
    id: "unlimited-exams",
    title: "আনলিমিটেড পরীক্ষা ও বিশ্লেষণ",
    subtitle: "প্র্যাকটিসের মাধ্যমে নিজের প্রস্তুতি যাচাই করো",
    icon: FileCheck,
  },
  {
    id: "ai-assistant",
    title: "AI অ্যাসিস্টেন্ট ও ডাউট সলভার",
    subtitle: "৩,০০০ AI ক্রেডিট প্রতি মাসে সাথে ভিডিও গাইড",
    icon: Sparkle,
  },
  {
    id: "live-model-tests",
    title: "লাইভ উইকলি মডেল টেস্ট",
    subtitle: "দেশসেরা শিক্ষার্থীদের সাথে এডমিশন স্ট্যান্ডার্ড পরীক্ষা",
    icon: Award,
  },
];

const FALLBACK_PACKAGES = [
  {
    id: "1-month",
    duration: "১ মাস",
    price: 249,
    originalPrice: 299,
    months: 1,
  },
  {
    id: "3-months",
    duration: "৩ মাস",
    price: 499,
    originalPrice: 599,
    months: 3,
  },
  {
    id: "6-months",
    duration: "৬ মাস",
    price: 799,
    originalPrice: 959,
    months: 6,
  },
  {
    id: "9-months",
    duration: "৯ মাস",
    subtitle: "অ্যাডমিশন শেষ পর্যন্ত",
    price: 949,
    originalPrice: 1139,
    months: 9,
    isPopular: true,
  },
];

const FALLBACK_ADDONS = [
  {
    id: "addon-ai-1000",
    name: "অতিরিক্ত ১,০০০ AI ক্রেডিট",
    description: "মেয়াদহীন AI ডাউট ও স্টেপ-বাই-স্টেপ সমাধান ক্রেডিট",
    price: 199,
  },
];

const SOCIAL_STUDENTS = [
  {
    name: "তানভীর আহমেদ",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    bg: "#fecaca",
  },
  {
    name: "সাদিয়া ইসলাম",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
    bg: "#bae6fd",
  },
  {
    name: "রাকিবুল হাসান",
    image:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80",
    bg: "#ddd6fe",
  },
];

export function UpgradeView() {
  const router = useRouter();
  const { data: config } = useBillingConfig();
  const packages =
    config?.packages && config.packages.length > 0 ? config.packages : FALLBACK_PACKAGES;
  const addons = config?.addons && config.addons.length > 0 ? config.addons : FALLBACK_ADDONS;

  const [selectedPackageId, setSelectedPackageId] = React.useState("9-months");
  const [selectedAddonIds, setSelectedAddonIds] = React.useState<string[]>([]);
  const [activeFeatureIndex, setActiveFeatureIndex] = React.useState(2);
  const [couponInput, setCouponInput] = React.useState("");
  const [appliedCoupon, setAppliedCoupon] = React.useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [couponError, setCouponError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validateCouponMutation = useValidateCoupon();
  const createOrderMutation = useCreateOrder();

  const selectedPackage = packages.find((p) => p.id === selectedPackageId) || packages[0];

  const addonsTotal = selectedAddonIds.reduce((sum, id) => {
    const addon = addons.find((a) => a.id === id);
    return sum + (addon ? addon.price : 0);
  }, 0);

  const baseTotal = selectedPackage.price + addonsTotal;
  const originalTotal = selectedPackage.originalPrice + addonsTotal;
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalTotal = Math.max(0, baseTotal - discountAmount);

  const toggleAddon = (addonId: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId],
    );
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    try {
      const res = await validateCouponMutation.mutateAsync({ code, amount: baseTotal });
      if (res.valid) {
        setAppliedCoupon({ code, discount: res.discount });
        setCouponInput("");
      } else {
        setCouponError(res.message || "অবৈধ কুপন কোড!");
      }
    } catch {
      if (code === "PAWS20" || code === "CHORCHA20") {
        setAppliedCoupon({ code, discount: Math.round(baseTotal * 0.2) });
        setCouponInput("");
      } else {
        setCouponError("অবৈধ কুপন কোড! দয়া করে সঠিক কোড দিন।");
      }
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const handleProceedToCheckout = async () => {
    setIsSubmitting(true);
    try {
      const res = await createOrderMutation.mutateAsync({
        packageId: selectedPackage.id,
        addonIds: selectedAddonIds,
        couponCode: appliedCoupon?.code,
      });

      if (res?.orderId) {
        router.push(`/checkout/${res.orderId}`);
      }
    } catch {
      alert("অর্ডার তৈরি করতে সমস্যা হয়েছে। দয়া করে পুনরায় চেষ্টা করুন অথবা লগইন করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto py-4 sm:py-6">
      <div className="flex w-full flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
        <div className="w-full shrink-0 lg:max-w-xs xl:max-w-sm lg:sticky lg:top-4">
          <div className="flex flex-col gap-5 sm:gap-6">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Sparkle className="size-3.5 fill-primary text-primary" />
                <span>পজ একাডেমি প্রিমিয়াম</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold leading-snug tracking-tight text-foreground">
                প্রিমিয়াম এ যেসকল ফিচারস থাকছে
              </h1>
              <p className="text-xs text-muted-foreground">
                তোমার এডমিশন ও বোর্ড পরীক্ষার প্রস্তুতিকে একধাপ এগিয়ে নিতে সব স্পেশাল সুবিধা এখন এক প্ল্যাটফর্মে।
              </p>
            </div>

            <div className="flex flex-col gap-1.5" role="listbox" aria-label="প্রিমিয়াম ফিচারসমূহ">
              {UPGRADE_FEATURES.map((feature, idx) => {
                const isSelected = idx === activeFeatureIndex;
                const IconComponent = feature.icon;

                return (
                  <button
                    key={feature.id}
                    type="button"
                    onClick={() => setActiveFeatureIndex(idx)}
                    className={cn(
                      "relative flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer",
                      isSelected
                        ? "bg-card border border-border shadow-xs"
                        : "hover:bg-card/50 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {isSelected && (
                      <span className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-primary" />
                    )}

                    <div
                      className={cn(
                        "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border",
                      )}
                    >
                      <IconComponent className="size-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block text-xs sm:text-sm font-semibold leading-snug",
                          isSelected ? "text-foreground" : "text-foreground/80",
                        )}
                      >
                        {feature.title}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                        {feature.subtitle}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 px-1 py-1">
              <div className="flex -space-x-2 overflow-hidden">
                {SOCIAL_STUDENTS.map((student, idx) => (
                  <img
                    key={idx}
                    src={student.image}
                    alt={student.name}
                    className="size-7 rounded-full border-2 border-background object-cover shadow-xs"
                    style={{ zIndex: SOCIAL_STUDENTS.length - idx }}
                  />
                ))}
              </div>
              <p className="text-xs leading-snug text-muted-foreground">
                <span className="font-semibold text-foreground">২৪,৫০০+ শিক্ষার্থী</span> ইতিমধ্যে যুক্ত হয়েছে
              </p>
            </div>
          </div>
        </div>

        <div className="relative w-full min-w-0 flex-1 select-none">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  প্যাকেজ নির্বাচন করো
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  তোমার প্রস্তুতির প্রয়োজন অনুযায়ী সেরা প্ল্যানটি বেছে নাও
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {packages.map((pkg) => {
                const isSelected = pkg.id === selectedPackageId;

                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={cn(
                      "flex w-full items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none",
                      isSelected
                        ? "border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/30 shadow-xs text-foreground"
                        : "border-border bg-card hover:border-border/80 hover:bg-muted/30 text-foreground/90",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                          isSelected
                            ? "border-primary bg-primary/20"
                            : "border-muted-foreground/40",
                        )}
                      >
                        {isSelected && <div className="size-2.5 rounded-full bg-primary" />}
                      </div>

                      <div className="flex flex-col">
                        <span className="text-sm sm:text-base font-semibold text-foreground">
                          {pkg.duration}
                        </span>
                        {pkg.subtitle && (
                          <span className="text-xs font-normal text-muted-foreground">
                            {pkg.subtitle}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-sm sm:text-base font-bold text-foreground leading-tight">
                        {toBengaliNumber(pkg.price)} টাকা
                      </div>
                      <div className="mt-0.5 text-[11px] sm:text-xs text-muted-foreground line-through">
                        {toBengaliNumber(pkg.originalPrice)} টাকা
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {addons.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Plus className="size-3.5 text-primary" /> প্রয়োজনীয় অ্যাড-অন (ঐচ্ছিক)
                  </span>
                </div>

                {addons.map((addon) => {
                  const isChecked = selectedAddonIds.includes(addon.id);

                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={cn(
                        "cursor-pointer flex items-center justify-between rounded-xl border p-3 transition-all",
                        isChecked
                          ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-xs"
                          : "border-border bg-card hover:bg-muted/30",
                      )}
                    >
                      <div className="flex items-start gap-2.5 min-w-0 pr-2">
                        <div
                          className={cn(
                            "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
                            isChecked
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-muted-foreground/40 bg-background",
                          )}
                        >
                          {isChecked && <Check className="size-3 stroke-[3]" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs sm:text-sm font-semibold text-foreground">
                            {addon.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{addon.description}</span>
                        </div>
                      </div>
                      <span className="font-bold text-xs sm:text-sm text-foreground shrink-0">
                        +৳{toBengaliNumber(addon.price)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-border">
              <label className="block text-xs font-semibold text-foreground">
                কুপন কোড (যদি থাকে)
              </label>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <Input
                  placeholder="যেমন: PAWS20"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="h-9 rounded-xl bg-background text-xs uppercase tracking-wider font-mono"
                />
                <Button
                  type="submit"
                  disabled={!couponInput.trim()}
                  isLoading={validateCouponMutation.isPending}
                  variant="secondary"
                  size="sm"
                  className="h-9 shrink-0 rounded-xl px-3 text-xs font-semibold cursor-pointer"
                >
                  প্রয়োগ করুন
                </Button>
              </form>
              {couponError && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <TriangleWarning className="size-3.5" />
                  {couponError}
                </p>
              )}
              {appliedCoupon && (
                <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <div className="flex items-center gap-1.5">
                    <Sparkle className="size-3.5" />
                    <span>কুপন ({appliedCoupon.code}) প্রযোজ্য হয়েছে</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">-৳{toBengaliNumber(appliedCoupon.discount)}</span>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs text-muted-foreground hover:text-foreground underline ml-1 cursor-pointer"
                    >
                      মুছুন
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 mt-1">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <span>মোট প্রদেয়: ৳{toBengaliNumber(finalTotal)}</span>
                  {originalTotal > finalTotal && (
                    <span className="text-[11px] text-muted-foreground line-through font-normal">
                      ৳{toBengaliNumber(originalTotal)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
                  <span>যেকোনো সময় প্ল্যান পরিবর্তনের সুবিধা</span>
                </div>
              </div>
              <Button
                size="lg"
                isLoading={isSubmitting}
                onClick={handleProceedToCheckout}
                className="font-bold text-sm shrink-0 w-full sm:w-auto cursor-pointer bg-gradient-to-r from-teal-500 via-indigo-600 to-indigo-700 text-white shadow-md hover:opacity-95"
              >
                <Sparkle className="size-4 fill-white mr-1.5" />
                <span>চেকআউটে যান</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpgradeView;
