import { zValidator } from "@hono/zod-validator";
import {
  and,
  asc,
  desc,
  eq,
  inArray,
  or,
  type SQL,
  sql,
} from "drizzle-orm";
import { Hono } from "hono";
import { v7 as uuidv7 } from "uuid";
import { z } from "zod";
import { db } from "../../db";
import {
  qbChapters,
  qbCustomExamQuestions,
  qbCustomExamSubmissions,
  qbCustomExams,
  qbCustomExamWrittenSubmissions,
  qbExamSheetQuestions,
  qbQuestionOptions,
  qbQuestionParts,
  qbQuestionSources,
  qbQuestions,
  qbSources,
  qbSubjects,
  qbTopics,
} from "../../db/schema";

import type { AuthContextVariables } from "../../middleware/auth.middleware";

const sourceTypeSchema = z.enum([
  "board",
  "university",
  "medical",
  "engineering",
  "bcs",
  "bank_job",
  "model_test",
  "other",
]);

const CACHE_CONTROL_PRIVATE = "private, no-store";
const EXAM_CANDIDATE_LIMIT = 2000;

function shuffle<T>(items: T[]): T[] {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = result[i] as T;
    result[i] = result[j] as T;
    result[j] = swap;
  }
  return result;
}

function mapQuestion(
  q: {
    id: string;
    topicId: string | null;
    qType: "mcq" | "written";
    questionText: string;
    contextText: string | null;
    explanation: string | null;
    options: Array<{
      id: string;
      optionText: string;
      isCorrect: boolean;
      orderIndex: number;
    }>;
    parts: Array<{
      id: string;
      partText: string;
      answerText: string | null;
      marks: number | string | null;
      orderIndex: number;
    }>;
    questionSources: Array<{
      source: {
        id: string;
        sourceGroup?: "academic" | "admission" | "job" | "other";
        type?:
          | "board"
          | "university"
          | "medical"
          | "engineering"
          | "bcs"
          | "bank_job"
          | "model_test"
          | "other";
        name: string;
        slug: string;
        institution: string | null;
        unit: string | null;
        year: number | null;
      };
    }>;
    topic: {
      id: string;
      parentTopicId: string | null;
      name: string;
      slug: string;
      orderIndex: number;
    } | null;
  },
  options: { includeAnswers: boolean },
) {
  const topic = q.topic
    ? {
        id: q.topic.id,
        parentTopicId: q.topic.parentTopicId,
        name: q.topic.name,
        slug: q.topic.slug,
        orderIndex: q.topic.orderIndex,
      }
    : null;
  return {
    id: q.id,
    topicId: q.topicId,
    qType: q.qType,
    questionText: q.questionText,
    contextText: q.contextText,
    explanation: options.includeAnswers ? q.explanation : null,
    options: q.options.map((opt) => ({
      id: opt.id,
      optionText: opt.optionText,
      isCorrect: options.includeAnswers ? opt.isCorrect : undefined,
      orderIndex: opt.orderIndex,
    })),
    parts: q.parts.map((p) => ({
      id: p.id,
      partText: p.partText,
      answerText: options.includeAnswers ? p.answerText : null,
      marks: p.marks,
      orderIndex: p.orderIndex,
    })),
    sources: q.questionSources.map((qs) => ({
      id: qs.source.id,
      sourceGroup: qs.source.sourceGroup,
      type: qs.source.type,
      name: qs.source.name,
      slug: qs.source.slug,
      institution: qs.source.institution,
      unit: qs.source.unit,
      year: qs.source.year,
    })),
    topic,
    topics: topic ? [topic] : [],
  };
}


export const examRoute = new Hono<{ Variables: AuthContextVariables }>()
  .post(
    "/custom",
    zValidator(
      "json",
      z.object({
        title: z.string().optional(),
        examType: z.enum(["mcq", "written", "mixed"]).optional().default("mcq"),
        questionCount: z.number().optional().default(10),
        mcqCount: z.number().optional(),
        writtenCount: z.number().optional(),
        durationMinutes: z.number().optional(),
        negativeMarks: z.string().optional().default("0.25"),
        targetIds: z.array(z.string()).optional().default([]),
        subjectIds: z.array(z.string()).optional().default([]),
        chapterIds: z.array(z.string()).optional().default([]),
        topicIds: z.array(z.string()).optional().default([]),
        examSheetIds: z.array(z.string()).optional().default([]),
        sourceIds: z.array(z.string()).optional().default([]),
        sourceTypes: z.array(sourceTypeSchema).optional().default([]),
      }),
    ),
    async (c) => {
      const userSession = c.get("user");
      const body = c.req.valid("json");

      const examType = body.examType ?? "mcq";
      const countRequested = Math.min(Math.max(Number(body.questionCount) || 10, 1), 100);
      const negativeMarks = body.negativeMarks ?? "0.25";
      const durationMinutes = Number(body.durationMinutes) || Math.max(5, countRequested);

      const subjectIds = [...body.subjectIds];
      if (body.targetIds.length > 0) {
        const matchedSubjects = await db
          .select({ id: qbSubjects.id })
          .from(qbSubjects)
          .where(inArray(qbSubjects.targetId, body.targetIds));
        for (const s of matchedSubjects) subjectIds.push(s.id);
      }

      const hierarchyConditions: SQL[] = [];
      if (subjectIds.length > 0 || body.chapterIds.length > 0) {
        // Collect all chapter IDs to filter by
        let chapterIds: string[] = [...body.chapterIds];
        if (subjectIds.length > 0) {
          const subjectChapters = await db
            .select({ id: qbChapters.id })
            .from(qbChapters)
            .where(inArray(qbChapters.subjectId, subjectIds));
          chapterIds = [...new Set([...chapterIds, ...subjectChapters.map((c) => c.id)])];
        }
        if (chapterIds.length > 0) {
          // Filter via topic_id → chapter (canonical path)
          hierarchyConditions.push(
            inArray(
              qbQuestions.topicId,
              db.select({ id: qbTopics.id }).from(qbTopics).where(inArray(qbTopics.chapterId, chapterIds)),
            ),
          );
        } else {
          hierarchyConditions.push(sql`false`);
        }
      }


      if (body.topicIds.length > 0) {
        hierarchyConditions.push(inArray(qbQuestions.topicId, body.topicIds));
      }

      const scopedConditions: SQL[] = [];
      if (hierarchyConditions.length > 0) {
        const combined = or(...hierarchyConditions);
        if (combined) scopedConditions.push(combined);
      }

      if (body.examSheetIds.length > 0) {
        const matched = await db
          .selectDistinct({ questionId: qbExamSheetQuestions.questionId })
          .from(qbExamSheetQuestions)
          .where(inArray(qbExamSheetQuestions.examSheetId, body.examSheetIds));
        const matchedIds = matched.map((m) => m.questionId);
        scopedConditions.push(
          matchedIds.length > 0 ? inArray(qbQuestions.id, matchedIds) : sql`false`,
        );
      }

      if (body.sourceIds.length > 0 || body.sourceTypes.length > 0) {
        const sourceConditions: SQL[] = [];
        if (body.sourceIds.length > 0) sourceConditions.push(inArray(qbSources.id, body.sourceIds));
        if (body.sourceTypes.length > 0) {
          sourceConditions.push(inArray(qbSources.type, body.sourceTypes));
        }
        const matched = await db
          .selectDistinct({ questionId: qbQuestionSources.questionId })
          .from(qbQuestionSources)
          .innerJoin(qbSources, eq(qbQuestionSources.sourceId, qbSources.id))
          .where(or(...sourceConditions));
        const matchedIds = matched.map((m) => m.questionId);
        scopedConditions.push(
          matchedIds.length > 0 ? inArray(qbQuestions.id, matchedIds) : sql`false`,
        );
      }

      let sampledQuestionIds: string[] = [];

      if (examType === "mixed") {
        const mcqCountReq = Math.min(Math.max(Number(body.mcqCount) || 10, 1), 100);
        const writtenCountReq = Math.min(Math.max(Number(body.writtenCount) || 2, 1), 50);

        const candidates = await db
          .select({ id: qbQuestions.id, qType: qbQuestions.qType })
          .from(qbQuestions)
          .where(
            and(
              eq(qbQuestions.status, "published"),
              inArray(qbQuestions.qType, ["mcq", "written"]),
              ...scopedConditions,
            ),
          );

        const mcqPool = candidates.filter((r) => r.qType === "mcq").map((r) => r.id);
        const writtenPool = candidates.filter((r) => r.qType === "written").map((r) => r.id);

        sampledQuestionIds = [
          ...mcqPool.sort(() => Math.random() - 0.5).slice(0, mcqCountReq),
          ...writtenPool.sort(() => Math.random() - 0.5).slice(0, writtenCountReq),
        ];
      } else {
        const typeCondition =
          examType === "written" ? eq(qbQuestions.qType, "written") : eq(qbQuestions.qType, "mcq");

        const candidateRows = await db
          .select({ id: qbQuestions.id })
          .from(qbQuestions)
          .where(and(typeCondition, eq(qbQuestions.status, "published"), ...scopedConditions))
          .limit(1000);

        sampledQuestionIds = candidateRows
          .map((r) => r.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, countRequested);
      }

      if (sampledQuestionIds.length === 0) {
        return c.json(
          {
            success: false,
            error: "No questions available for this selection",
          },
          400,
        );
      }

      const examId = uuidv7();
      const examTitle =
        body.title?.trim() || `কাস্টম পরীক্ষা (${new Date().toLocaleDateString("bn-BD")})`;

      await db.insert(qbCustomExams).values({
        id: examId,
        userId: userSession?.id ?? null,
        title: examTitle,
        examType,
        questionCount: sampledQuestionIds.length,
        durationMinutes,
        negativeMarks,
        totalMarks: sampledQuestionIds.length,
        config: JSON.stringify({
          targetIds: body.targetIds,
          subjectIds: body.subjectIds,
          chapterIds: body.chapterIds,
          topicIds: body.topicIds,
          sourceIds: body.sourceIds,
          sourceTypes: body.sourceTypes,
        }),
      });

      await db.insert(qbCustomExamQuestions).values(
        sampledQuestionIds.map((qId, idx) => ({
          customExamId: examId,
          questionId: qId,
          questionNumber: idx + 1,
        })),
      );

      return c.json({
        success: true,
        data: {
          id: examId,
          title: examTitle,
          questionCount: sampledQuestionIds.length,
          durationMinutes,
        },
      });
    },
  )
  .get("/custom/:id/take", zValidator("param", z.object({ id: z.string() })), async (c) => {
    const { id: examId } = c.req.valid("param");

    const exam = await db.query.qbCustomExams.findFirst({
      where: eq(qbCustomExams.id, examId),
    });

    if (!exam) {
      return c.json({ success: false, error: "Exam not found" }, 404);
    }

    const examQuestionsList = await db.query.qbCustomExamQuestions.findMany({
      where: eq(qbCustomExamQuestions.customExamId, examId),
      orderBy: [asc(qbCustomExamQuestions.questionNumber)],
      with: {
        question: {
          with: {
            options: { orderBy: [asc(qbQuestionOptions.orderIndex)] },
            parts: { orderBy: [asc(qbQuestionParts.orderIndex)] },
            questionSources: { with: { source: true } },
            topic: true,
          },
        },
      },
    });

    c.header("Cache-Control", CACHE_CONTROL_PRIVATE);
    return c.json({
      success: true,
      data: {
        exam: {
          id: exam.id,
          userId: exam.userId,
          title: exam.title,
          examType: exam.examType,
          questionCount: exam.questionCount,
          durationMinutes: exam.durationMinutes,
          negativeMarks: exam.negativeMarks,
          totalMarks: exam.totalMarks,
          createdAt: exam.createdAt.toISOString(),
        },
        questions: examQuestionsList.map((row) =>
          mapQuestion(row.question, { includeAnswers: false }),
        ),
      },
    });
  })
  .post(
    "/custom/:id/submit",
    zValidator("param", z.object({ id: z.string() })),
    zValidator(
      "json",
      z.object({
        answers: z.record(z.string(), z.string()).optional().default({}),
        writtenAnswers: z
          .array(
            z.object({
              questionId: z.string(),
              partId: z.string().optional(),
              pageNumber: z.number().optional().default(1),
              imageUrl: z.string(),
            }),
          )
          .optional(),
        timeSpentSeconds: z.number().optional().default(0),
      }),
    ),
    async (c) => {
      const userSession = c.get("user");
      const { id: examId } = c.req.valid("param");
      const body = c.req.valid("json");

      const exam = await db.query.qbCustomExams.findFirst({
        where: eq(qbCustomExams.id, examId),
      });

      if (!exam) {
        return c.json({ success: false, error: "Exam not found" }, 404);
      }

      const examQuestionsList = await db.query.qbCustomExamQuestions.findMany({
        where: eq(qbCustomExamQuestions.customExamId, examId),
        with: { question: { with: { options: true, parts: true } } },
      });

      const userAnswers = body.answers || {};
      const negPenalty = Number.parseFloat(exam.negativeMarks) || 0.25;

      let correctCount = 0;
      let wrongCount = 0;
      let unansweredCount = 0;
      let mcqScore = 0;

      for (const eqRow of examQuestionsList) {
        const q = eqRow.question;
        if (q.qType === "mcq") {
          const studentChoice = userAnswers[q.id];
          if (!studentChoice) {
            unansweredCount++;
          } else {
            const correctOpt = q.options.find((opt) => opt.isCorrect);
            if (correctOpt && correctOpt.id === studentChoice) {
              correctCount++;
              mcqScore += 1;
            } else {
              wrongCount++;
              mcqScore -= negPenalty;
            }
          }
        }
      }

      const finalScore = Math.max(0, mcqScore);
      const hasWritten = exam.examType === "written" || exam.examType === "mixed";
      const submissionStatus = hasWritten ? "pending_evaluation" : "auto_evaluated";
      const submissionId = uuidv7();

      await db.insert(qbCustomExamSubmissions).values({
        id: submissionId,
        customExamId: examId,
        userId: userSession?.id ?? null,
        status: submissionStatus,
        score: finalScore.toFixed(2),
        writtenScore: "0",
        writtenTotalMarks: 0,
        correctCount,
        wrongCount,
        unansweredCount,
        timeSpentSeconds: Number(body.timeSpentSeconds) || 0,
        answers: JSON.stringify(userAnswers),
      });

      if (body.writtenAnswers && body.writtenAnswers.length > 0) {
        await db.insert(qbCustomExamWrittenSubmissions).values(
          body.writtenAnswers.map((w) => ({
            id: uuidv7(),
            submissionId,
            questionId: w.questionId,
            partId: w.partId ?? null,
            pageNumber: w.pageNumber || 1,
            imageUrl: w.imageUrl,
          })),
        );
      }

      return c.json({
        success: true,
        data: {
          id: submissionId,
          customExamId: examId,
          status: submissionStatus,
          score: finalScore.toFixed(2),
          correctCount,
          wrongCount,
          unansweredCount,
        },
      });
    },
  )
  .get(
    "/custom/:id/solve",
    zValidator("param", z.object({ id: z.string() })),
    zValidator("query", z.object({ submissionId: z.string().optional() })),
    async (c) => {
      const { id: examId } = c.req.valid("param");
      const { submissionId } = c.req.valid("query");

      const exam = await db.query.qbCustomExams.findFirst({
        where: eq(qbCustomExams.id, examId),
      });

      if (!exam) {
        return c.json({ success: false, error: "Exam not found" }, 404);
      }

      const submissionRow = submissionId
        ? await db.query.qbCustomExamSubmissions.findFirst({
            where: and(
              eq(qbCustomExamSubmissions.id, submissionId),
              eq(qbCustomExamSubmissions.customExamId, examId),
            ),
          })
        : await db.query.qbCustomExamSubmissions.findFirst({
            where: eq(qbCustomExamSubmissions.customExamId, examId),
            orderBy: [desc(qbCustomExamSubmissions.submittedAt)],
          });

      const examQuestionsList = await db.query.qbCustomExamQuestions.findMany({
        where: eq(qbCustomExamQuestions.customExamId, examId),
        orderBy: [asc(qbCustomExamQuestions.questionNumber)],
        with: {
          question: {
            with: {
              options: { orderBy: [asc(qbQuestionOptions.orderIndex)] },
              parts: { orderBy: [asc(qbQuestionParts.orderIndex)] },
              questionSources: { with: { source: true } },
              topic: true,
            },
          },
        },
      });

      let studentAnswers: Record<string, string> = {};
      if (submissionRow?.answers) {
        try {
          studentAnswers = typeof submissionRow.answers === "string" ? JSON.parse(submissionRow.answers) : (submissionRow.answers as any) ?? {};
        } catch {
          studentAnswers = {};
        }
      }

      const writtenSubmissionsList = submissionRow
        ? await db.query.qbCustomExamWrittenSubmissions.findMany({
            where: eq(qbCustomExamWrittenSubmissions.submissionId, submissionRow.id),
            orderBy: [asc(qbCustomExamWrittenSubmissions.pageNumber)],
          })
        : [];

      c.header("Cache-Control", CACHE_CONTROL_PRIVATE);
      return c.json({
        success: true,
        data: {
          exam: {
            id: exam.id,
            userId: exam.userId,
            title: exam.title,
            examType: exam.examType,
            questionCount: exam.questionCount,
            durationMinutes: exam.durationMinutes,
            negativeMarks: exam.negativeMarks,
            totalMarks: exam.totalMarks,
            createdAt: exam.createdAt.toISOString(),
          },
          submission: submissionRow
            ? {
                id: submissionRow.id,
                customExamId: submissionRow.customExamId,
                userId: submissionRow.userId,
                status: submissionRow.status,
                score: submissionRow.score,
                writtenScore: submissionRow.writtenScore,
                writtenTotalMarks: submissionRow.writtenTotalMarks,
                correctCount: submissionRow.correctCount,
                wrongCount: submissionRow.wrongCount,
                unansweredCount: submissionRow.unansweredCount,
                timeSpentSeconds: submissionRow.timeSpentSeconds,
                answers: submissionRow.answers,
                evaluatorId: submissionRow.evaluatorId,
                evaluatorFeedback: submissionRow.evaluatorFeedback,
                evaluatedAt: submissionRow.evaluatedAt
                  ? submissionRow.evaluatedAt.toISOString()
                  : null,
                submittedAt: submissionRow.submittedAt.toISOString(),
              }
            : null,
          questions: examQuestionsList.map((row) =>
            mapQuestion(row.question, { includeAnswers: true }),
          ),
          studentAnswers,
          writtenSubmissions: writtenSubmissionsList.map((w) => ({
            id: w.id,
            questionId: w.questionId,
            partId: w.partId,
            pageNumber: w.pageNumber,
            imageUrl: w.imageUrl,
            annotatedImageUrl: w.annotatedImageUrl,
            marksAwarded: w.marksAwarded,
            maxMarks: w.maxMarks,
            feedback: w.feedback,
          })),
        },
      });
    },
  );
