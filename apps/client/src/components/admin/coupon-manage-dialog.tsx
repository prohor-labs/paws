"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Clock, Sparkle, Tag, X, XCircle } from "@/components/icons";
import { ResponsiveDialog } from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useCreateCoupon, useDeleteCoupon, useUpdateCoupon } from "@/hooks/use-billing";
import type { Coupon } from "@/lib/api/types";

interface CouponManageDialogProps {
  coupon: Coupon | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CouponManageDialog({ coupon, open, onOpenChange }: CouponManageDialogProps) {
  const isEditing = Boolean(coupon);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState<string>("");
  const [minSpend, setMinSpend] = useState<string>("0");
  const [maxDiscount, setMaxDiscount] = useState<string>("");
  const [usageLimit, setUsageLimit] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [active, setActive] = useState<boolean>(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();
  const deleteMutation = useDeleteCoupon();

  useEffect(() => {
    if (coupon) {
      setCode(coupon.code);
      setType(coupon.type);
      setValue(String(coupon.value));
      setMinSpend(String(coupon.minSpend ?? 0));
      setMaxDiscount(coupon.maxDiscount != null ? String(coupon.maxDiscount) : "");
      setUsageLimit(coupon.usageLimit != null ? String(coupon.usageLimit) : "");
      if (coupon.expiresAt) {
        const d = new Date(coupon.expiresAt);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const min = String(d.getMinutes()).padStart(2, "0");
        setExpiresAt(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
      } else {
        setExpiresAt("");
      }
      setActive(coupon.active);
      setConfirmDelete(false);
    } else {
      setCode("");
      setType("percentage");
      setValue("");
      setMinSpend("0");
      setMaxDiscount("");
      setUsageLimit("");
      setExpiresAt("");
      setActive(true);
      setConfirmDelete(false);
    }
  }, [coupon]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      toast.error("কুপন কোড প্রদান করুন");
      return;
    }

    const numValue = Number(value);
    if (Number.isNaN(numValue) || numValue <= 0) {
      toast.error("সঠিক ছাড়ের পরিমাণ প্রদান করুন");
      return;
    }

    const numMinSpend = Number(minSpend);
    const numMaxDiscount = maxDiscount.trim() ? Number(maxDiscount) : undefined;
    const numUsageLimit = usageLimit.trim() ? Number(usageLimit) : undefined;
    const formattedExpiresAt = expiresAt ? new Date(expiresAt).toISOString() : null;

    try {
      if (isEditing && coupon) {
        await updateMutation.mutateAsync({
          couponId: coupon.id,
          input: {
            code: cleanCode,
            type,
            value: numValue,
            minSpend: Number.isNaN(numMinSpend) ? 0 : numMinSpend,
            maxDiscount:
              numMaxDiscount !== undefined && Number.isNaN(numMaxDiscount) ? null : numMaxDiscount,
            usageLimit:
              numUsageLimit !== undefined && Number.isNaN(numUsageLimit) ? null : numUsageLimit,
            expiresAt: formattedExpiresAt,
            active,
          },
        });
        toast.success("কুপন সফলভাবে হালনাগাদ করা হয়েছে");
      } else {
        await createMutation.mutateAsync({
          code: cleanCode,
          type,
          value: numValue,
          minSpend: Number.isNaN(numMinSpend) ? 0 : numMinSpend,
          maxDiscount:
            numMaxDiscount !== undefined && Number.isNaN(numMaxDiscount)
              ? undefined
              : numMaxDiscount,
          usageLimit:
            numUsageLimit !== undefined && Number.isNaN(numUsageLimit) ? undefined : numUsageLimit,
          expiresAt: formattedExpiresAt,
          active,
        });
        toast.success("নতুন কুপন সফলভাবে তৈরি করা হয়েছে");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error((err as { message?: string })?.message || "কুপন সংরক্ষণ করতে ব্যর্থ হয়েছে");
    }
  };

  const handleDelete = async () => {
    if (!coupon) return;
    try {
      await deleteMutation.mutateAsync(coupon.id);
      toast.success("কুপনটি মুছে ফেলা হয়েছে");
      onOpenChange(false);
    } catch (err) {
      toast.error((err as { message?: string })?.message || "কুপন মুছে ফেলতে ব্যর্থ হয়েছে");
    }
  };

  const isPending =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(next) => {
        if (!isPending) onOpenChange(next);
      }}
      title={isEditing ? `কুপন পরিচালনা: ${coupon?.code}` : "নতুন কুপন যোগ করুন"}
      description={
        isEditing
          ? "কুপনের ছাড়ের হার, মেয়াদ এবং অন্যান্য শর্তাবলী সম্পাদনা করুন"
          : "শিক্ষার্থীদের জন্য নতুন ডিসকাউন্ট কুপন তৈরি করুন"
      }
      className="sm:max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="coupon-code" className="text-xs font-semibold">
              কুপন কোড <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="coupon-code"
                placeholder="যেমন: PAWS20"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="pl-9 font-mono uppercase font-bold tracking-wider"
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              ডিসকাউন্টের ধরন <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={type === "percentage" ? "default" : "outline"}
                size="sm"
                onClick={() => setType("percentage")}
                className="w-full text-xs"
                disabled={isPending}
              >
                <Sparkle className="size-3.5 mr-1" />
                শতাংশ (%)
              </Button>
              <Button
                type="button"
                variant={type === "fixed" ? "default" : "outline"}
                size="sm"
                onClick={() => setType("fixed")}
                className="w-full text-xs"
                disabled={isPending}
              >
                <Tag className="size-3.5 mr-1" />
                নির্দিষ্ট (৳)
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="coupon-value" className="text-xs font-semibold">
              ছাড়ের পরিমাণ ({type === "percentage" ? "%" : "৳"}){" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="coupon-value"
              type="number"
              min="1"
              max={type === "percentage" ? "100" : undefined}
              step="any"
              placeholder={type === "percentage" ? "২০" : "১০০"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="coupon-min-spend" className="text-xs font-semibold">
              সর্বনিম্ন ক্রয়মূল্য (৳)
            </Label>
            <Input
              id="coupon-min-spend"
              type="number"
              min="0"
              step="any"
              placeholder="০ (প্রযোজ্য না হলে)"
              value={minSpend}
              onChange={(e) => setMinSpend(e.target.value)}
              disabled={isPending}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="coupon-max-discount" className="text-xs font-semibold">
              সর্বোচ্চ ছাড়ের সীমা (৳) {type === "percentage" ? "" : "(ঐচ্ছিক)"}
            </Label>
            <Input
              id="coupon-max-discount"
              type="number"
              min="0"
              step="any"
              placeholder="সীমাহীন হলে খালি রাখুন"
              value={maxDiscount}
              onChange={(e) => setMaxDiscount(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="coupon-usage-limit" className="text-xs font-semibold">
              সর্বমোট ব্যবহারের সীমা
            </Label>
            <Input
              id="coupon-usage-limit"
              type="number"
              min="1"
              placeholder="সীমাহীন হলে খালি রাখুন"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              disabled={isPending}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="coupon-expires-at" className="text-xs font-semibold">
            মেয়াদ উত্তীর্ণের সময় (ঐচ্ছিক)
          </Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="coupon-expires-at"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="pl-9 text-xs"
              disabled={isPending}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/30 p-3.5">
          <div className="space-y-0.5">
            <div className="text-sm font-medium">কুপনের সক্রিয় অবস্থা</div>
            <div className="text-xs text-muted-foreground">
              সক্রিয় থাকলে শিক্ষার্থীরা চেকআউটে এই কুপন ব্যবহার করতে পারবে
            </div>
          </div>
          <Switch checked={active} onCheckedChange={setActive} disabled={isPending} />
        </div>

        {isEditing && coupon && (
          <div className="rounded-xl border border-border/60 bg-card p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>মোট ব্যবহার হয়েছে:</span>
              <span className="font-semibold text-foreground font-mono">
                {coupon.usageCount} বার
              </span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>তৈরি হয়েছে:</span>
              <span>{new Date(coupon.createdAt).toLocaleString("bn-BD")}</span>
            </div>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          {isEditing ? (
            <div>
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Spinner className="size-3.5 mr-1" />
                    ) : (
                      <X className="size-3.5 mr-1" />
                    )}
                    মুছে ফেলার নিশ্চিত করুন
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDelete(false)}
                    disabled={isPending}
                  >
                    বাতিল
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDelete(true)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive w-full sm:w-auto"
                  disabled={isPending}
                >
                  <XCircle className="size-3.5 mr-1" />
                  কুপন মুছুন
                </Button>
              )}
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              বাতিল
            </Button>
            <Button type="submit" size="sm" disabled={isPending} className="w-full sm:w-auto">
              {isPending && <Spinner className="size-3.5 mr-1" />}
              {isEditing ? "হালনাগাদ করুন" : "কুপন তৈরি করুন"}
            </Button>
          </div>
        </div>
      </form>
    </ResponsiveDialog>
  );
}
