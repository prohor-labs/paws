"use client";

import { useState } from "react";
import { OrderManageDialog } from "@/components/admin/order-manage-dialog";
import { InfoCircle, Refresh, Search, Sliders, Tag, X } from "@/components/icons";
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
import { useAllOrders } from "@/hooks/use-billing";
import type { BillingOrder } from "@/lib/api/types";

const STATUS_FILTERS = [
  { label: "সবগুলো", value: "all" },
  { label: "অপেক্ষমাণ", value: "pending" },
  { label: "পরিশোধিত", value: "paid" },
  { label: "ব্যর্থ", value: "failed" },
  { label: "বাতিলকৃত", value: "canceled" },
] as const;

type StatusFilterType = (typeof STATUS_FILTERS)[number]["value"];

function getQuickBadgeVariant(
  status: BillingOrder["status"],
): "success" | "warning" | "destructive" | "default" | "secondary" {
  switch (status) {
    case "paid":
      return "success";
    case "pending":
      return "warning";
    case "failed":
    case "canceled":
      return "destructive";
    default:
      return "secondary";
  }
}

function getStatusLabel(status: BillingOrder["status"]) {
  switch (status) {
    case "paid":
      return "পরিশোধিত";
    case "pending":
      return "অপেক্ষমাণ";
    case "failed":
      return "ব্যর্থ";
    case "canceled":
      return "বাতিলকৃত";
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

export function OrdersView() {
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedOrder, setSelectedOrder] = useState<BillingOrder | null>(null);

  const queryParams = {
    status: statusFilter === "all" ? undefined : statusFilter,
    search: searchQuery.trim() || undefined,
    page,
    limit: pageSize,
  };

  const { data, isLoading, isFetching, refetch } = useAllOrders(queryParams);

  const orders = data?.orders || [];
  const totalCount = data?.total || 0;
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 1;

  const handleStatusFilterChange = (filter: StatusFilterType) => {
    setStatusFilter(filter);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(1);
  };

  const quickItems: QuickListItem[] = orders.map((order) => {
    const hasPaymentInfo = order.senderNumber || order.transactionId;
    const addonNames = order.addons?.map((a) => a.name).join(", ");

    return {
      id: order.id,
      title: `${order.user?.name || "নামহীন শিক্ষার্থী"} — ৳${order.totalPayable}`,
      subtitle: `${order.packageDuration} • ${order.user?.email || "—"} • ${formatDate(order.createdAt)}`,
      logoUrl: order.user?.image || null,
      fallbackText: order.user?.name || "U",
      badgeText: getStatusLabel(order.status),
      badgeVariant: getQuickBadgeVariant(order.status),
      onClick: () => setSelectedOrder(order),
      tags: [
        {
          text: (order.paymentMethod || "ম্যানুয়াল").toUpperCase(),
        },
        ...(hasPaymentInfo && order.senderNumber
          ? [
              {
                text: `প্রেরক: ${order.senderNumber}`,
              },
            ]
          : []),
        ...(order.transactionId
          ? [
              {
                text: `Trx: ${order.transactionId}`,
              },
            ]
          : []),
        ...(order.couponCode
          ? [
              {
                text: `কুপন: ${order.couponCode}`,
              },
            ]
          : []),
        ...(addonNames
          ? [
              {
                icon: <Tag className="size-3" />,
                text: addonNames,
              },
            ]
          : []),
      ],
      actions: (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedOrder(order);
          }}
          className="h-8 px-3 text-xs font-medium gap-1"
        >
          <Sliders className="size-3.5" />
          ম্যানেজ
        </Button>
      ),
    };
  });

  const getPageNumbers = () => {
    const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("ellipsis-start");
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push("ellipsis-end");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            অর্ডার ও পেমেন্ট ব্যবস্থাপনা
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            শিক্ষার্থীদের প্যাকেজ ক্রয় ও ম্যানুয়াল পেমেন্ট ট্রানজেকশন পরিচালনা করুন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} isLoading={isFetching}>
            <Refresh className="size-4" />
            রিফ্রেশ
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-xs">
          <div className="text-xs font-medium text-muted-foreground">মোট অর্ডার</div>
          <div className="text-2xl font-bold mt-1 text-foreground">{totalCount} টি</div>
        </div>

        <div className="rounded-xl border bg-amber-500/5 border-amber-500/20 p-4 text-card-foreground shadow-xs">
          <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
            অপেক্ষমাণ পেমেন্ট
          </div>
          <div className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
            {orders.filter((o) => o.status === "pending").length} টি (এই পৃষ্ঠায়)
          </div>
        </div>

        <div className="rounded-xl border bg-emerald-500/5 border-emerald-500/20 p-4 text-card-foreground shadow-xs">
          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            অনুমোদিত পেমেন্ট
          </div>
          <div className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
            {orders.filter((o) => o.status === "paid").length} টি (এই পৃষ্ঠায়)
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <Button
              key={f.value}
              variant={statusFilter === f.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusFilterChange(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="নম্বর, ট্রানজেকশন বা ইমেইল..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 h-9"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <div>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center rounded-xl border bg-card shadow-xs">
            <Spinner className="size-6 text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border bg-card shadow-xs">
            <InfoCircle className="size-10 text-muted-foreground/50 mb-3" />
            <h3 className="font-medium text-foreground">কোনো অর্ডার পাওয়া যায়নি</h3>
            <p className="text-sm text-muted-foreground mt-1">
              প্রদত্ত ফিল্টার অনুযায়ী কোনো অর্ডারের রেকর্ড নেই।
            </p>
          </div>
        ) : (
          <QuickList items={quickItems} />
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/60">
          <div className="text-xs text-muted-foreground">
            মোট <span className="font-medium text-foreground">{totalCount}</span> টি অর্ডারের মধ্যে পৃষ্ঠা{" "}
            <span className="font-medium text-foreground">{page}</span> / {totalPages}
          </div>

          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (pagination?.hasPrev) setPage((p) => Math.max(1, p - 1));
                  }}
                  className={!pagination?.hasPrev ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {getPageNumbers().map((pNum) => {
                if (typeof pNum !== "number") {
                  return (
                    <PaginationItem key={pNum}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                return (
                  <PaginationItem key={pNum}>
                    <PaginationLink
                      href="#"
                      isActive={pNum === page}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(pNum);
                      }}
                    >
                      {pNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (pagination?.hasNext) setPage((p) => Math.min(totalPages, p + 1));
                  }}
                  className={!pagination?.hasNext ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <OrderManageDialog
        order={selectedOrder}
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      />
    </div>
  );
}
