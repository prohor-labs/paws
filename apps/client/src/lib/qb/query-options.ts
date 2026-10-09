import { queryOptions } from "@tanstack/react-query";
import { api, qbKeys } from "@/lib/api";
import type {
  QBChapterDetailData,
  QBChapterQueryParams,
  QBContainerDetailData,
  QBItemDetailData,
  QBQuestion,
  QBTargetDetailData,
  QBTree,
} from "@/lib/api/types";

const STALE_TIME = 0;

export function qbTargetQueryOptions(slug: string) {
  return queryOptions<QBTargetDetailData>({
    queryKey: qbKeys.target(slug),
    queryFn: () => api.qb.getTarget(slug),
    enabled: Boolean(slug),
    staleTime: STALE_TIME,
  });
}

export function qbContainerQueryOptions(targetSlug: string, containerSlug: string) {
  return queryOptions<QBContainerDetailData>({
    queryKey: qbKeys.container(targetSlug, containerSlug),
    queryFn: () => api.qb.getContainer(targetSlug, containerSlug),
    enabled: Boolean(targetSlug && containerSlug),
    staleTime: STALE_TIME,
  });
}

export function qbItemQueryOptions(targetSlug: string, containerSlug: string, itemSlug: string) {
  return queryOptions<QBItemDetailData>({
    queryKey: qbKeys.item(targetSlug, containerSlug, itemSlug),
    queryFn: () => api.qb.getContainerItem(targetSlug, containerSlug, itemSlug),
    enabled: Boolean(targetSlug && containerSlug && itemSlug),
    staleTime: STALE_TIME,
  });
}

export function qbChapterQueryOptions(
  subjectSlug: string,
  chapterSlug: string,
  params?: QBChapterQueryParams,
) {
  return queryOptions<QBChapterDetailData>({
    queryKey: qbKeys.chapter(subjectSlug, chapterSlug, params),
    queryFn: () => api.qb.getChapterQuestions(subjectSlug, chapterSlug, params),
    enabled: Boolean(subjectSlug && chapterSlug),
    staleTime: STALE_TIME,
  });
}

export function qbQuestionQueryOptions(id: string) {
  return queryOptions<QBQuestion>({
    queryKey: qbKeys.question(id),
    queryFn: () => api.qb.getQuestion(id),
    enabled: Boolean(id),
    staleTime: STALE_TIME,
  });
}

export function qbTreeQueryOptions() {
  return queryOptions<QBTree>({
    queryKey: qbKeys.tree(),
    queryFn: () => api.qb.getTree(),
    staleTime: STALE_TIME,
  });
}
