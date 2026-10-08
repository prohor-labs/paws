import { queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/sdk";
import type {
  QBChapterDetailData,
  QBChapterQueryParams,
  QBContainerDetailData,
  QBItemDetailData,
  QBQuestion,
  QBTargetDetailData,
  QBTree,
} from "@/types";

const STALE_TIME = 5 * 60 * 1000;

const qbQueryKeys = {
  target: (slug: string) => ["qb", "target", slug] as const,
  container: (targetSlug: string, containerSlug: string) =>
    ["qb", "container", targetSlug, containerSlug] as const,
  item: (targetSlug: string, containerSlug: string, itemSlug: string) =>
    ["qb", "item", targetSlug, containerSlug, itemSlug] as const,
  chapter: (subjectSlug: string, chapterSlug: string, params?: QBChapterQueryParams) =>
    ["qb", "chapter", subjectSlug, chapterSlug, params ?? {}] as const,
  question: (id: string) => ["qb", "question", id] as const,
  tree: () => ["qb", "tree"] as const,
};

async function unwrap<T>(res: { ok: boolean; json: () => Promise<unknown> }, message: string) {
  if (!res.ok) {
    throw new Error(message);
  }
  const json = (await res.json()) as { success: boolean; data: T };
  return json.data;
}

async function fetchQBTarget(slug: string): Promise<QBTargetDetailData> {
  return unwrap<QBTargetDetailData>(
    await api.rpc.qb.targets[":slug"].$get({ param: { slug } }),
    "Failed to fetch target details",
  );
}

async function fetchQBContainer(
  targetSlug: string,
  containerSlug: string,
): Promise<QBContainerDetailData> {
  return unwrap<QBContainerDetailData>(
    await api.rpc.qb.targets[":targetSlug"].containers[":containerSlug"].$get({
      param: { targetSlug, containerSlug },
    }),
    "Failed to fetch container details",
  );
}

async function fetchQBItem(
  targetSlug: string,
  containerSlug: string,
  itemSlug: string,
): Promise<QBItemDetailData> {
  return unwrap<QBItemDetailData>(
    await api.rpc.qb.targets[":targetSlug"].containers[":containerSlug"].items[":itemSlug"].$get({
      param: { targetSlug, containerSlug, itemSlug },
    }),
    "Failed to fetch item details",
  );
}

async function fetchQBChapter(
  subjectSlug: string,
  chapterSlug: string,
  params?: QBChapterQueryParams,
): Promise<QBChapterDetailData> {
  const query: Record<string, string> = {};
  if (params?.page) query.page = String(params.page);
  if (params?.limit) query.limit = String(params.limit);
  if (params?.targetSlug) query.targetSlug = params.targetSlug;
  if (params?.sourceType) query.sourceType = params.sourceType;
  if (params?.topicId && params.topicId !== "all") query.topicId = params.topicId;
  if (params?.source && params.source !== "all") query.source = params.source;
  if (params?.sourceId) query.sourceId = params.sourceId;
  if (params?.sourceSlug) query.sourceSlug = params.sourceSlug;
  if (params?.examSheet) query.examSheet = params.examSheet;
  if (params?.examSheetId) query.examSheetId = params.examSheetId;
  if (params?.examSheetSlug) query.examSheetSlug = params.examSheetSlug;
  if (params?.subjectSlug && params.subjectSlug !== "all") query.subjectSlug = params.subjectSlug;
  if (params?.qType) query.qType = params.qType;

  return unwrap<QBChapterDetailData>(
    await api.rpc.qb.subjects[":subjectSlug"].chapters[":chapterSlug"].$get({
      param: { subjectSlug, chapterSlug },
      query,
    }),
    "Failed to fetch chapter questions",
  );
}

async function fetchQBQuestion(id: string): Promise<QBQuestion> {
  return unwrap<QBQuestion>(
    await api.rpc.qb.questions[":id"].$get({ param: { id } }),
    "Failed to fetch question",
  );
}

async function fetchQBTree(): Promise<QBTree> {
  return unwrap<QBTree>(await api.rpc.qb.tree.$get(), "Failed to fetch QB tree");
}

export function qbTargetQueryOptions(slug: string) {
  return queryOptions({
    queryKey: qbQueryKeys.target(slug),
    queryFn: () => fetchQBTarget(slug),
    enabled: Boolean(slug),
    staleTime: STALE_TIME,
  });
}

export function qbContainerQueryOptions(targetSlug: string, containerSlug: string) {
  return queryOptions({
    queryKey: qbQueryKeys.container(targetSlug, containerSlug),
    queryFn: () => fetchQBContainer(targetSlug, containerSlug),
    enabled: Boolean(targetSlug && containerSlug),
    staleTime: STALE_TIME,
  });
}

export function qbItemQueryOptions(targetSlug: string, containerSlug: string, itemSlug: string) {
  return queryOptions({
    queryKey: qbQueryKeys.item(targetSlug, containerSlug, itemSlug),
    queryFn: () => fetchQBItem(targetSlug, containerSlug, itemSlug),
    enabled: Boolean(targetSlug && containerSlug && itemSlug),
    staleTime: STALE_TIME,
  });
}

export function qbChapterQueryOptions(
  subjectSlug: string,
  chapterSlug: string,
  params?: QBChapterQueryParams,
) {
  return queryOptions({
    queryKey: qbQueryKeys.chapter(subjectSlug, chapterSlug, params),
    queryFn: () => fetchQBChapter(subjectSlug, chapterSlug, params),
    enabled: Boolean(subjectSlug && chapterSlug),
    staleTime: STALE_TIME,
  });
}

export function qbQuestionQueryOptions(id: string) {
  return queryOptions({
    queryKey: qbQueryKeys.question(id),
    queryFn: () => fetchQBQuestion(id),
    enabled: Boolean(id),
    staleTime: STALE_TIME,
  });
}

export function qbTreeQueryOptions() {
  return queryOptions({
    queryKey: qbQueryKeys.tree(),
    queryFn: fetchQBTree,
    staleTime: STALE_TIME,
  });
}
