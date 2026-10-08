"use client";

import { useQuery } from "@tanstack/react-query";
import {
  qbChapterQueryOptions,
  qbContainerQueryOptions,
  qbItemQueryOptions,
  qbQuestionQueryOptions,
  qbTargetQueryOptions,
  qbTreeQueryOptions,
} from "@/lib/qb/query-options";
import type { QBChapterQueryParams } from "@/types";


export function useQBTargetDetail(targetSlug: string) {
  return useQuery(qbTargetQueryOptions(targetSlug));
}

export function useQBContainerDetail(targetSlug: string, containerSlug: string) {
  return useQuery(qbContainerQueryOptions(targetSlug, containerSlug));
}

export function useQBItemDetail(targetSlug: string, containerSlug: string, itemSlug: string) {
  return useQuery(qbItemQueryOptions(targetSlug, containerSlug, itemSlug));
}

export function useQBChapterDetail(
  subjectSlug: string,
  chapterSlug: string,
  params?: QBChapterQueryParams,
) {
  return useQuery(qbChapterQueryOptions(subjectSlug, chapterSlug, params));
}

export function useQBQuestionDetail(questionId: string) {
  return useQuery(qbQuestionQueryOptions(questionId));
}

export function useQBTree() {
  return useQuery(qbTreeQueryOptions());
}

export {
  useCreateCustomExam,
  useCustomExamTake,
  useSubmitCustomExam,
  useCustomExamSolve,
} from "./use-exam";
