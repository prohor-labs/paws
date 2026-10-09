import type { GetAllCouponsInput, GetAllOrdersInput, QBChapterQueryParams } from "./types";

export const apiQueryKeys = {
  all: ["api"] as const,
  health: () => [...apiQueryKeys.all, "health"] as const,
};

export const billingKeys = {
  all: ["billing"] as const,
  config: () => [...billingKeys.all, "config"] as const,
  status: () => [...billingKeys.all, "status"] as const,
  order: (orderId: string) => [...billingKeys.all, "order", orderId] as const,
  adminOrders: (params?: GetAllOrdersInput) =>
    [...billingKeys.all, "admin-orders", params ?? {}] as const,
  adminCoupons: (params?: GetAllCouponsInput) =>
    [...billingKeys.all, "admin-coupons", params ?? {}] as const,
};

export const examKeys = {
  all: ["exam"] as const,
  take: (id: string) => [...examKeys.all, id, "take"] as const,
  solve: (id: string, submissionId?: string) =>
    [...examKeys.all, id, "solve", submissionId ?? null] as const,
};

export const qbKeys = {
  all: ["qb"] as const,
  target: (slug: string) => [...qbKeys.all, "target", slug] as const,
  container: (targetSlug: string, containerSlug: string) =>
    [...qbKeys.all, "container", targetSlug, containerSlug] as const,
  item: (targetSlug: string, containerSlug: string, itemSlug: string) =>
    [...qbKeys.all, "item", targetSlug, containerSlug, itemSlug] as const,
  chapter: (subjectSlug: string, chapterSlug: string, params?: QBChapterQueryParams) =>
    [...qbKeys.all, "chapter", subjectSlug, chapterSlug, params ?? {}] as const,
  question: (id: string) => [...qbKeys.all, "question", id] as const,
  tree: () => [...qbKeys.all, "tree"] as const,
  custom: (id?: string) =>
    id ? ([...qbKeys.all, "custom", id] as const) : ([...qbKeys.all, "custom"] as const),
};

export const watchKeys = {
  all: ["watch"] as const,
  feed: (category?: string, search?: string) =>
    [...watchKeys.all, "feed", category ?? "All", search ?? ""] as const,
  video: (id: string) => [...watchKeys.all, "video", id] as const,
  channel: (handle: string) => [...watchKeys.all, "channel", handle] as const,
  playlist: (slugOrId: string) => [...watchKeys.all, "playlist", slugOrId] as const,
  comments: (id: string) => [...watchKeys.all, "comments", id] as const,
  saved: () => [...watchKeys.all, "library", "saved"] as const,
};
