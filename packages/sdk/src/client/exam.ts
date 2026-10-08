import type {
  CreateCustomExamInput,
  CustomExamSolveData,
  CustomExamTakeData,
} from "../types/qb";
import { ApiError } from "./errors";
import type { HcApp, RpcClient } from "./rpc";

export interface CreateExamResult {
  id: string;
  examId: string;
  title: string;
  totalQuestions: number;
  questionCount?: number;
  durationMinutes: number;
  negativeMarks: string;
  examType: string;
}

export interface SubmitExamResult {
  id: string;
  submissionId: string;
  score: number | string;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  timeSpentSeconds: number;
  status: string;
}

export class ExamClient<TAppType extends HcApp = HcApp> {
  // biome-ignore lint/suspicious/noExplicitAny: uses generic RPC client
  private readonly rpcAny: any;

  constructor(rpc: RpcClient<TAppType>) {
    this.rpcAny = rpc;
  }

  /**
   * Generates a new practice or mock exam from selected question bank criteria
   */
  async create(input: CreateCustomExamInput): Promise<CreateExamResult> {
    const res = await this.rpcAny.exam.custom.$post({ json: input });
    if (!res.ok) {
      throw await ApiError.fromResponse(res, "Failed to create exam");
    }
    const data = await res.json();
    const examData = data.data;
    return {
      id: examData.id ?? examData.examId,
      examId: examData.examId ?? examData.id,
      title: examData.title,
      totalQuestions: examData.totalQuestions ?? examData.questionCount ?? 0,
      questionCount: examData.questionCount ?? examData.totalQuestions ?? 0,
      durationMinutes: examData.durationMinutes,
      negativeMarks: examData.negativeMarks,
      examType: examData.examType,
    };
  }

  /**
   * Fetches an exam session for taking (sanitized questions without answers)
   */
  async getTakeSession(examId: string): Promise<CustomExamTakeData> {
    const res = await this.rpcAny.exam.custom[":id"].take.$get({
      param: { id: examId },
    });
    if (!res.ok) {
      throw await ApiError.fromResponse(res, "Failed to fetch exam session");
    }
    const data = await res.json();
    return data.data as CustomExamTakeData;
  }

  /**
   * Submits answers for evaluation
   */
  async submit(
    examId: string,
    payload: {
      timeSpentSeconds: number;
      answers: Record<string, string>;
      writtenSubmissions?: Array<{
        questionId: string;
        partId?: string;
        pageNumber?: number;
        imageUrl: string;
      }>;
    },
  ): Promise<SubmitExamResult> {
    const res = await this.rpcAny.exam.custom[":id"].submit.$post({
      param: { id: examId },
      json: payload,
    });
    if (!res.ok) {
      throw await ApiError.fromResponse(res, "Failed to submit exam");
    }
    const data = await res.json();
    const sub = data.data;
    return {
      id: sub.id ?? sub.submissionId,
      submissionId: sub.submissionId ?? sub.id,
      score: sub.score,
      correctCount: sub.correctCount,
      wrongCount: sub.wrongCount,
      unansweredCount: sub.unansweredCount,
      timeSpentSeconds: sub.timeSpentSeconds,
      status: sub.status,
    };
  }

  /**
   * Retrieves solved exam with solutions and evaluated score
   */
  async getSolution(
    examId: string,
    submissionId?: string,
  ): Promise<CustomExamSolveData> {
    const res = await this.rpcAny.exam.custom[":id"].solve.$get({
      param: { id: examId },
      query: submissionId ? { submissionId } : {},
    });
    if (!res.ok) {
      throw await ApiError.fromResponse(res, "Failed to fetch exam solution");
    }
    const data = await res.json();
    return data.data as unknown as CustomExamSolveData;
  }
}
