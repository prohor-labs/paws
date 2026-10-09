import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, examKeys, qbKeys } from "@/lib/api";
import type {
  CreateCustomExamInput,
  CustomExamSolveData,
  CustomExamTakeData,
  SubmitCustomExamInput,
} from "@/lib/api/types";

export function useCreateCustomExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCustomExamInput) => api.exam.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.all });
      queryClient.invalidateQueries({ queryKey: qbKeys.custom() });
    },
  });
}

export function useCustomExamTake(id: string) {
  return useQuery({
    queryKey: examKeys.take(id),
    queryFn: (): Promise<CustomExamTakeData> => api.exam.getTakeSession(id),
    enabled: Boolean(id),
    staleTime: 0,
  });
}

export function useSubmitCustomExam(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitCustomExamInput) =>
      api.exam.submit(id, {
        timeSpentSeconds: input.timeSpentSeconds,
        answers: input.answers,
        writtenSubmissions: input.writtenAnswers,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.all });
      queryClient.invalidateQueries({ queryKey: qbKeys.custom(id) });
    },
  });
}

export function useCustomExamSolve(id: string, submissionId?: string) {
  return useQuery({
    queryKey: examKeys.solve(id, submissionId),
    queryFn: (): Promise<CustomExamSolveData> => api.exam.getSolution(id, submissionId),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
}
