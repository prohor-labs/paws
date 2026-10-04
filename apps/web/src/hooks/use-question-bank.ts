"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  qbChapterQueryOptions,
  qbContainerQueryOptions,
  qbHubQueryOptions,
  qbItemQueryOptions,
  qbQuestionQueryOptions,
  qbTargetQueryOptions,
  qbTreeQueryOptions,
} from "@/lib/qb/query-options";
import { api } from "@/lib/sdk";
import type {
  CreateCustomExamInput,
  CustomExamSolveData,
  CustomExamTakeData,
  QBChapterQueryParams,
  SubmitCustomExamInput,
} from "@/types";

export function useQBHub() {
  return useQuery(qbHubQueryOptions());
}

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

export function useCreateCustomExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCustomExamInput) => {
      const res = await api.rpc.qb.custom.$post({ json: input });
      if (!res.ok) {
        throw new Error("Failed to create custom exam");
      }
      const json = (await res.json()) as {
        success: boolean;
        data: { id: string; title: string; questionCount: number; durationMinutes: number };
      };
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qb", "custom"] });
    },
  });
}

export function useCustomExamTake(id: string) {
  return useQuery({
    queryKey: ["qb", "custom", id, "take"],
    queryFn: async (): Promise<CustomExamTakeData> => {
      const res = await api.rpc.qb.custom[":id"].take.$get({ param: { id } });
      if (!res.ok) {
        throw new Error("Failed to fetch custom exam");
      }
      const json = (await res.json()) as { success: boolean; data: CustomExamTakeData };
      return json.data;
    },
    enabled: Boolean(id),
    staleTime: 0,
  });
}

export function useSubmitCustomExam(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SubmitCustomExamInput) => {
      const res = await api.rpc.qb.custom[":id"].submit.$post({ param: { id }, json: input });
      if (!res.ok) {
        throw new Error("Failed to submit custom exam");
      }
      const json = (await res.json()) as {
        success: boolean;
        data: { id: string; customExamId: string; status: string; score: string };
      };
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qb", "custom", id] });
    },
  });
}

export function useCustomExamSolve(id: string, submissionId?: string) {
  return useQuery({
    queryKey: ["qb", "custom", id, "solve", submissionId],
    queryFn: async (): Promise<CustomExamSolveData> => {
      const res = await api.rpc.qb.custom[":id"].solve.$get({
        param: { id },
        query: submissionId ? { submissionId } : {},
      });
      if (!res.ok) {
        throw new Error("Failed to fetch custom exam solve details");
      }
      const json = (await res.json()) as { success: boolean; data: CustomExamSolveData };
      return json.data;
    },
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}
