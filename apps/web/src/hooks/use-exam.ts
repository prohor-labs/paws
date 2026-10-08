import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateCustomExamInput,
  CustomExamSolveData,
  CustomExamTakeData,
  SubmitCustomExamInput,
} from "@paws/sdk";
import { api } from "@/lib/sdk/client";

export function useCreateCustomExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCustomExamInput) => {
      return api.exam.create(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam"] });
      queryClient.invalidateQueries({ queryKey: ["qb", "custom"] });
    },
  });
}

export function useCustomExamTake(id: string) {
  return useQuery({
    queryKey: ["exam", id, "take"],
    queryFn: async (): Promise<CustomExamTakeData> => {
      return api.exam.getTakeSession(id);
    },
    enabled: Boolean(id),
    staleTime: 0,
  });
}

export function useSubmitCustomExam(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SubmitCustomExamInput) => {
      return api.exam.submit(id, {
        timeSpentSeconds: input.timeSpentSeconds,
        answers: input.answers,
        writtenSubmissions: input.writtenAnswers,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam", id] });
      queryClient.invalidateQueries({ queryKey: ["qb", "custom", id] });
    },
  });
}

export function useCustomExamSolve(id: string, submissionId?: string) {
  return useQuery({
    queryKey: ["exam", id, "solve", submissionId],
    queryFn: async (): Promise<CustomExamSolveData> => {
      return api.exam.getSolution(id, submissionId);
    },
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}

