"use client";

import { useState } from "react";
import { CouponManageDialog } from "@/components/admin/coupon-manage-dialog";
import { Plus, Refresh, Search, Sparkle, Tag, X } from "@/components/icons";
import { QuickList, type QuickListItem } from "@/components/shared/quick-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";
import { useAllCoupons } from "@/hooks/use-billing";
import type { Coupon } from "@/lib/api/types";

function formatDate(dateValue: string | Date | null | undefined) {
  if (!dateValue) return "আজীবন";
  const date = new Date(dateValue);
  return date.toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isExpired(expiresAt?: string | Date | null) {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
}

export function CouponsView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const queryParams = {
    search: searchQuery.trim() || undefined,
    page,
    limit: pageSize,
  };

  const { data, isLoading, isFetching, refetch } = useAllCoupons(queryParams);

  const coupons = data?.coupons || [];
  const totalCount = data?.total || 0;
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 1;

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleOpenCreate = () => {
    setSelectedCoupon(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsDialogOpen(true);
  };

  const quickListItems: QuickListItem[] = coupons.map((c) => {
    const expired = isExpired(c.expiresAt);
    const limitReached = c.usageLimit != null && c.usageCount >= c.usageLimit;

    let statusText = "সক্রিয়";
    let statusVariant: QuickListItem["badgeVariant"] = "success";

    if (!c.active) {
      statusText = "নিষ্ক্রিয়";
      statusVariant = "secondary";
    } else if (expired) {
      statusText = "মেয়াদোত্তীর্ণ";
      statusVariant = "destructive";
    } else if (limitReached) {
      statusText = "সীমা সমাপ্ত";
      statusVariant = "warning";
    }

    const discountText = c.type === "percentage" ? `${c.value}% ছাড়` : `৳${c.value} ছাড়`;

    const subtitleParts: string[] = [];
    if (Number(c.minSpend) > 0) {
      subtitleParts.push(`সর্বনিম্ন ক্রয় ৳${c.minSpend}`);
    }
    if (c.maxDiscount != null) {
      subtitleParts.push(`সর্বোচ্চ ছাড় ৳${c.maxDiscount}`);
    }
    if (c.expiresAt) {
      subtitleParts.push(`মেয়াদ: ${formatDate(c.expiresAt)}`);
    } else {
      subtitleParts.push("মেয়াদ: আজীবন");
    }

    return {
      id: c.id,
      title: (
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold tracking-wider text-base text-foreground">
            {c.code}
          </span>
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            {discountText}
          </span>
        </div>
      ),
      subtitle: subtitleParts.join(" • "),
      icon: (
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {c.type === "percentage" ? <Sparkle className="size-5" /> : <Tag className="size-5" />}
        </div>
      ),
      badgeText: statusText,
      badgeVariant: statusVariant,
      tags: [
        {
          icon: <Tag className="size-3" />,
          text: c.type === "percentage" ? "শতাংশ" : "ফ্ল্যাট",
          variant: "outline",
        },
        {
          text: `ব্যবহার: ${c.usageCount}${c.usageLimit ? `/${c.usageLimit}` : ""}`,
          variant: limitReached ? "destructive" : "secondary",
        },
      ],
      actions: (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(c);
            }}
          >
            সম্পাদনা
          </Button>
        </div>
      ),
      onClick: () => handleOpenEdit(c),
    };
  });

  const getVisiblePages = () => {
    const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (page > 3) {
        pages.push("ellipsis-start");
      }
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) {
        pages.push("ellipsis-end");
      }
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Tag className="size-6 text-primary" />
            কুপন ও ছাড় ব্যবস্থাপনা
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            শিক্ষার্থীদের জন্য প্রো প্যাকেজ ও এড-অনের ডিসকাউন্ট কুপন তৈরি ও পরিচালনা
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9"
          >
            <Refresh className={`size-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
            রিফ্রেশ
          </Button>
          <Button size="sm" onClick={handleOpenCreate} className="h-9">
            <Plus className="size-4 mr-1.5" />
            নতুন কুপন তৈরি করুন
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border/80 shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="কুপন কোড দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 bg-background border-border/60 text-sm h-9"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="text-xs text-muted-foreground font-medium px-2 shrink-0">
          সর্বমোট কুপন: <span className="font-semibold text-foreground font-mono">{totalCount}</span>{" "}
          টি
        </div>
      </div>

      <div>
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Spinner className="size-8 text-primary" />
            <p className="text-sm text-muted-foreground">কুপন লোড হচ্ছে...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground bg-muted/20 border border-dashed border-border rounded-2xl flex flex-col items-center gap-3">
            <Tag className="size-10 text-muted-foreground/60" />
            <div>
              <p className="font-medium text-foreground">কোনো কুপন পাওয়া যায়নি</p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery
                  ? "আপনার অনুসন্ধানের সাথে মিলে এমন কোনো কুপন নেই।"
                  : "এখনই একটি নতুন ডিসকাউন্ট কুপন তৈরি করুন।"}
              </p>
            </div>
            {!searchQuery && (
              <Button size="sm" onClick={handleOpenCreate} className="mt-2">
                <Plus className="size-4 mr-1.5" />
                নতুন কুপন তৈরি করুন
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <QuickList items={quickListItems} />

            {totalPages > 1 && (
              <div className="pt-4 flex items-center justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (page > 1) setPage(page - 1);
                        }}
                        aria-disabled={page <= 1}
                        className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {getVisiblePages().map((p) =>
                      typeof p === "number" ? (
                        <PaginationItem key={`page-${p}`}>
                          <PaginationLink
                            href="#"
                            isActive={page === p}
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(p);
                            }}
                            className="cursor-pointer"
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={p}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ),
                    )}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (page < totalPages) setPage(page + 1);
                        }}
                        aria-disabled={page >= totalPages}
                        className={
                          page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        )}
      </div>

      <CouponManageDialog
        coupon={selectedCoupon}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
