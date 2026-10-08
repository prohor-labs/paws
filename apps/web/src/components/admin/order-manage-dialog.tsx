"use client";

import { useState } from "react";
import type { BillingOrder } from "@paws/sdk";
import { toast } from "sonner";
import {
  Check,
  CheckCircle,
  Copy,
  Tag,
  X,
} from "@/components/icons";
import { ResponsiveDialog } from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useUpdateOrderStatus } from "@/hooks/use-billing";
import { copyToClipboard } from "@/lib/clipboard";

interface OrderManageDialogProps {
  order: BillingOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getStatusBadge(status: BillingOrder["status"]) {
  switch (status) {
    case "paid":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <CheckCircle className="size-3.5" />
          পরিশোধিত
        </span>
      );
    case "pending":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
          <Spinner className="size-3" />
          অপেক্ষমাণ
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-medium text-rose-600 dark:text-rose-400">
          <X className="size-3.5" />
          ব্যর্থ
        </span>
      );
    case "canceled":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          বাতিলকৃত
        </span>
      );
  }
}

function formatDate(dateValue: string | Date | null) {
  if (!dateValue) return "—";
  const date = new Date(dateValue);
  return date.toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderManageDialog({
  order,
  open,
  onOpenChange,
}: OrderManageDialogProps) {
  const [confirmStatus, setConfirmStatus] = useState<"paid" | "canceled" | null>(null);
  const updateStatusMutation = useUpdateOrderStatus();

  if (!order) return null;

  const handleCopyLink = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/checkout/${order.id}`;
    const success = await copyToClipboard(url);
    if (success) {
      toast.success("ইনভয়েস লিংক কপি করা হয়েছে");
    } else {
      toast.error("লিংক কপি করা যায়নি");
    }
  };

  const handleStatusChange = async (status: "paid" | "canceled") => {
    try {
      await updateStatusMutation.mutateAsync({ orderId: order.id, status });
      toast.success(
        status === "paid"
          ? "অর্ডারটি সফলভাবে অনুমোদন করা হয়েছে"
          : "অর্ডারটি বাতিল করা হয়েছে",
      );
      setConfirmStatus(null);
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে",
      );
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setConfirmStatus(null);
        onOpenChange(next);
      }}
      title="অর্ডার ও পেমেন্ট বিবরণী"
      description={`অর্ডার আইডি: ${order.id}`}
    >
      <div className="space-y-4 text-sm pt-2">
        <div className="rounded-xl border bg-muted/20 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">শিক্ষার্থী:</span>
            <span className="font-semibold text-foreground">
              {order.user?.name || "নামহীন শিক্ষার্থী"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">ইমেইল:</span>
            <span className="font-medium text-foreground">
              {order.user?.email || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">অর্ডার তারিখ:</span>
            <span className="font-medium text-foreground">
              {formatDate(order.createdAt)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">বর্তমান অবস্থা:</span>
            <div>{getStatusBadge(order.status)}</div>
          </div>
        </div>

        <div className="rounded-xl border bg-muted/20 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">প্যাকেজ:</span>
            <span className="font-medium text-foreground">
              {order.packageDuration} (৳{order.packagePrice})
            </span>
          </div>
          {order.addons && order.addons.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">এড-অন সমূহ:</span>
              <span className="font-medium text-foreground flex items-center gap-1">
                <Tag className="size-3 text-primary" />
                {order.addons.map((a) => a.name).join(", ")} (+৳{order.addonsTotal})
              </span>
            </div>
          )}
          {order.couponCode && (
            <div className="flex items-center justify-between text-primary font-medium">
              <span>কুপন ({order.couponCode}):</span>
              <span>-৳{order.discountAmount}</span>
            </div>
          )}
          <div className="border-t border-border/60 pt-2 flex items-center justify-between font-bold text-foreground">
            <span>সর্বমোট পরিশোধযোগ্য:</span>
            <span className="text-base text-primary">৳{order.totalPayable}</span>
          </div>
        </div>

        <div className="rounded-xl border bg-muted/20 p-3.5 space-y-2">
          <div className="font-semibold text-foreground">পেমেন্ট ট্রানজেকশন তথ্য:</div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">পেমেন্ট মেথড:</span>
            <span className="font-semibold uppercase text-foreground">
              {order.paymentMethod || "ম্যানুয়াল"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">প্রেরক মোবাইল নম্বর:</span>
            <span className="font-mono font-medium text-foreground">
              {order.senderNumber || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">ট্রানজেকশন আইডি:</span>
            <span className="font-mono font-medium text-foreground">
              {order.transactionId || "—"}
            </span>
          </div>
          {order.paidAt && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">অনুমোদনের তারিখ:</span>
              <span className="font-medium text-foreground">
                {formatDate(order.paidAt)}
              </span>
            </div>
          )}
        </div>

        {confirmStatus ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
            <div className="font-semibold text-foreground">
              {confirmStatus === "paid"
                ? "পেমেন্ট অনুমোদন নিশ্চিতকরণ"
                : "অর্ডার বাতিল নিশ্চিতকরণ"}
            </div>
            <p className="text-xs text-muted-foreground">
              {confirmStatus === "paid"
                ? `আপনি কি নিশ্চিত যে ৳${order.totalPayable} টাকার পেমেন্টটি অনুমোদন করবেন? এটি শিক্ষার্থীর সাবস্ক্রিপশন ও AI ক্রেডিট সক্রিয় করে দেবে।`
                : "আপনি কি নিশ্চিত যে এই অর্ডারটি বাতিল করতে চান?"}
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmStatus(null)}
                disabled={updateStatusMutation.isPending}
              >
                ফিরে যান
              </Button>
              <Button
                variant={confirmStatus === "paid" ? "default" : "destructive"}
                size="sm"
                isLoading={updateStatusMutation.isPending}
                onClick={() => handleStatusChange(confirmStatus)}
              >
                {confirmStatus === "paid" ? "হ্যাঁ, অনুমোদন করুন" : "হ্যাঁ, বাতিল করুন"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
            >
              <Copy className="size-4 mr-1.5" />
              ইনভয়েস লিংক
            </Button>

            <div className="flex items-center gap-2">
              {order.status === "pending" && (
                <>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setConfirmStatus("canceled")}
                  >
                    <X className="size-3.5 mr-1" />
                    বাতিল করুন
                  </Button>

                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setConfirmStatus("paid")}
                  >
                    <Check className="size-3.5 mr-1" />
                    অনুমোদন করুন
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </ResponsiveDialog>
  );
}
