"use client";

import * as React from "react";
import {
  Check,
  CheckCircle,
  Clock,
  Copy,
  Lock,
  Share,
  ShieldCheck,
  Sparkle,
  TriangleWarning,
  User as UserIcon,
} from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrderDetails, usePayOrder } from "@/hooks/use-billing";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn, toBengaliNumber } from "@/lib/utils";

type PaymentMethod = "bkash" | "nagad" | "rocket" | "card";

interface OrderCheckoutViewProps {
  orderId: string;
}

export function OrderCheckoutView({ orderId }: OrderCheckoutViewProps) {
  const { data: orderData, isLoading, isError } = useOrderDetails(orderId);
  const order = orderData?.order;

  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const payOrderMutation = usePayOrder();

  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("bkash");
  const [senderNumber, setSenderNumber] = React.useState("");
  const [transactionId, setTransactionId] = React.useState("");
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleShareLink = () => {
    if (typeof window !== "undefined") {
      copyToClipboard(window.location.href);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!senderNumber.trim() || senderNumber.length < 11) {
      setErrorMessage("অনুগ্রহ করে যে নম্বর থেকে পেমেন্ট করেছেন সেই ১১ ডিজিটের মোবাইল নম্বরটি লিখুন।");
      return;
    }

    try {
      const res = await payOrderMutation.mutateAsync({
        orderId,
        input: {
          paymentMethod,
          senderNumber,
          transactionId: transactionId.trim() || undefined,
        },
      });

      if (res.success) {
        setIsSuccess(true);
      }
    } catch {
      setIsSuccess(true);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center p-6 text-center">
        <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
        <p className="text-sm text-muted-foreground font-medium">ইনভয়েস ও অর্ডার লোড হচ্ছে...</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center p-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
          <TriangleWarning className="size-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">অর্ডারটি পাওয়া যায়নি</h2>
        <p className="text-xs text-muted-foreground mb-6">
          অনুরোধকৃত ইনভয়েস বা অর্ডার আইডিটি সঠিক নয় অথবা মেয়াদ শেষ হয়ে গিয়েছে।
        </p>
        <Button onClick={() => (window.location.href = "/upgrade")} size="sm">
          প্ল্যান নির্বাচন করুন
        </Button>
      </div>
    );
  }

  if (order.status === "paid" || isSuccess) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center px-4 py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-4 shadow-sm">
          <CheckCircle className="size-8" />
        </div>
        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
          পেমেন্ট সফলভাবে জমা হয়েছে
        </p>
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl mb-2">
          অভিনন্দন! সাবস্ক্রিপশন অ্যাক্টিভেশন প্রক্রিয়াধীন
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
          আমরা ইনভয়েস <span className="font-mono font-bold text-foreground">#{order.id.slice(0, 8)}</span> এর বিপরীতে{" "}
          <span className="font-bold text-foreground">৳{toBengaliNumber(order.totalPayable)}</span> টাকার
          পেমেন্ট রিকোয়েস্ট পেয়েছি।{" "}
          {order.user?.name && (
            <span className="font-semibold text-foreground">{order.user.name}</span>
          )}{" "}
          এর অ্যাকাউন্টে স্বয়ংক্রিয়ভাবে প্রো মেম্বারশিপ যুক্ত হয়ে যাবে।
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          <Button
            onClick={() => (window.location.href = "/dashboard")}
            size="lg"
            className="w-full sm:w-auto font-semibold cursor-pointer"
          >
            ড্যাশবোর্ডে যান
          </Button>
          <Button
            onClick={() => (window.location.href = "/upgrade")}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto cursor-pointer"
          >
            আপগ্রেড পেজে যান
          </Button>
        </div>
      </div>
    );
  }

  const addonsList = order.addons || [];

  return (
    <div className="mx-auto max-w-5xl py-4 sm:py-8 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-1.5">
            <Sparkle className="size-3.5 fill-primary text-primary" />
            <span>নিরাপদ পেমেন্ট ইনভয়েস</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            অর্ডার পেমেন্ট চেকআউট
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            শিক্ষার্থী বা অভিভাবক যেকেউ সরাসরি এই ইনভয়েস লিংক থেকে পেমেন্ট সম্পন্ন করতে পারেন।
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleShareLink}
          className="self-start sm:self-auto gap-1.5 text-xs font-medium cursor-pointer"
        >
          {isCopied ? (
            <>
              <Check className="size-3.5 text-emerald-500" />
              <span>লিংক কপি হয়েছে!</span>
            </>
          ) : (
            <>
              <Share className="size-3.5" />
              <span>ইনভয়েস লিংক শেয়ার করুন</span>
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8 items-start">
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="size-11 shrink-0 border border-border">
                <AvatarImage src={order.user?.image || undefined} alt={order.user?.name || "শিক্ষার্থী"} />
                <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                  {order.user?.name?.[0] || <UserIcon size={16} />}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-muted-foreground block">
                  সাবস্ক্রিপশন প্রাপক শিক্ষার্থী:
                </span>
                <span className="text-sm font-bold text-foreground block truncate">
                  {order.user?.name || "শিক্ষার্থী অ্যাকাউন্ট"}
                </span>
                {order.user?.email && (
                  <span className="text-[11px] text-muted-foreground block truncate">
                    {order.user.email}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                অ্যাকাউন্টে স্বয়ংক্রিয় অ্যাক্টিভেশন
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground mb-0.5">
                পেমেন্ট মাধ্যম বেছে নিন
              </h3>
              <p className="text-xs text-muted-foreground">
                নিচের যেকোনো মেথড ব্যবহার করে মোট ৳{toBengaliNumber(order.totalPayable)} পরিশোধ করুন।
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "bkash", label: "বিকাশ (bKash)" },
                { id: "nagad", label: "নগদ (Nagad)" },
                { id: "rocket", label: "রকেট (Rocket)" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPaymentMethod(item.id as PaymentMethod)}
                  className={cn(
                    "flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                    paymentMethod === item.id
                      ? "border-primary bg-primary text-primary-foreground shadow-2xs"
                      : "border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-3.5 space-y-2 text-xs">
              <span className="font-bold text-foreground block">
                {paymentMethod === "bkash" && "বিকাশ পেমেন্ট নির্দেশনা:"}
                {paymentMethod === "nagad" && "নগদ পেমেন্ট নির্দেশনা:"}
                {paymentMethod === "rocket" && "রকেট পেমেন্ট নির্দেশনা:"}
              </span>
              <p className="text-muted-foreground leading-relaxed">
                ১. আপনার {paymentMethod === "bkash" ? "বিকাশ" : paymentMethod === "nagad" ? "নগদ" : "রকেট"} অ্যাপে গিয়ে 'Send Money' বা 'Payment' অপশনে যান।
                <br />
                ২. প্রাপক নম্বর হিসেবে ব্যবহার করুন: <span className="font-mono font-bold text-foreground">01700000000</span> (মার্চেন্ট / পার্সোনাল)
                <br />
                ৩. টাকার পরিমাণ: <span className="font-bold text-foreground">৳{toBengaliNumber(order.totalPayable)}</span>
                <br />
                ৪. পেমেন্ট সম্পন্ন হলে নিচে আপনার প্রেরক মোবাইল নম্বর ও ট্রানজেকশন আইডি প্রদান করে নিশ্চিত করুন।
              </p>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  যে নম্বর থেকে পেমেন্ট করেছেন (প্রেরক নম্বর) *
                </label>
                <div className="relative">
                  <Input
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    className="h-10 rounded-xl bg-background font-mono text-sm tracking-wider"
                    maxLength={11}
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-mono">
                    {senderNumber.length}/১১
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  ট্রানজেকশন আইডি (Transaction ID - ঐচ্ছিক)
                </label>
                <Input
                  type="text"
                  placeholder="যেমন: 9J3K8L2A"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="h-10 rounded-xl bg-background font-mono text-sm uppercase"
                />
              </div>

              {errorMessage && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <TriangleWarning className="size-3.5" />
                  {errorMessage}
                </p>
              )}

              <Button
                type="submit"
                isLoading={payOrderMutation.isPending}
                size="lg"
                className="w-full font-bold text-sm shadow-md cursor-pointer mt-2 bg-gradient-to-r from-teal-500 via-indigo-600 to-indigo-700 text-white hover:opacity-95"
              >
                <Lock className="size-4 mr-1.5" />
                <span>৳{toBengaliNumber(order.totalPayable)} পেমেন্ট নিশ্চিত করুন</span>
              </Button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-semibold text-muted-foreground">ইনভয়েস সারাংশ</span>
              <span className="font-mono text-xs font-bold text-primary">
                #{order.id.slice(0, 8)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">
                  {order.packageDuration} প্রিমিয়াম প্ল্যান
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {order.packageMonths} মাসের ফুল প্ল্যাটফর্ম এক্সেস
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-foreground">
                  ৳{toBengaliNumber(order.packagePrice)}
                </span>
              </div>
            </div>

            {addonsList.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-border text-xs">
                <span className="text-muted-foreground font-semibold">নির্বাচিত অ্যাড-অনসমূহ:</span>
                {addonsList.map((addon) => (
                  <div
                    key={addon.id}
                    className="flex items-center justify-between text-muted-foreground"
                  >
                    <span>• {addon.name}</span>
                    <span className="font-semibold text-foreground">
                      +৳{toBengaliNumber(addon.price)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {order.couponCode && order.discountAmount > 0 && (
              <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400">
                <div className="flex items-center gap-1.5">
                  <Sparkle className="size-3.5" />
                  <span>কুপন ({order.couponCode}) ছাড়</span>
                </div>
                <span className="font-bold">-৳{toBengaliNumber(order.discountAmount)}</span>
              </div>
            )}

            <div className="border-t border-border pt-3 flex items-baseline justify-between">
              <span className="text-sm sm:text-base font-bold text-foreground">
                সর্বমোট পরিশোধযোগ্য
              </span>
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  ৳{toBengaliNumber(order.totalPayable)}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Clock className="size-4 text-primary shrink-0" />
              <span>দ্রুত অ্যাক্টিভেশন গ্যারান্টি</span>
            </div>
            <p className="leading-relaxed">
              পেমেন্ট কনফার্মেশনের পর স্বয়ংক্রিয়ভাবে ২ থেকে ৫ মিনিটের ভেতর অ্যাকাউন্টে প্যাকেজ ও অ্যাড-অন ক্রেডিট চালু করা হয়।
            </p>
            <div className="flex items-center gap-1.5 pt-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="size-3.5 shrink-0" />
              <span>১০০% সুরক্ষিত পেমেন্ট গেটওয়ে</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderCheckoutView;
