import { Injectable } from '@nestjs/common';
import { and, asc, desc, eq, inArray, or, type SQL, sql } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { DrizzleService } from '../../common/database/drizzle.service.js';
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
} from '../../common/database/schema/index.js';
import { ApiError } from '../../common/errors/api-error.js';
import { mapQuestion } from '../qb/qb.mapper.js';
import type { CreateCustomExamDto, SubmitCustomExamDto } from './exam.dto.js';

@Injectable()
export class ExamService {
  constructor(private readonly drizzle: DrizzleService) {}

  private get db() {
    return this.drizzle.db;
  }

  async createCustomExam(body: CreateCustomExamDto, userId: string | null) {
    const examType = body.examType ?? 'mcq';
    const countRequested = Math.min(Math.max(Number(body.questionCount) || 10, 1), 100);
    const negativeMarks = body.negativeMarks ?? '0.25';
    const durationMinutes = Number(body.durationMinutes) || Math.max(5, countRequested);

    const subjectIds = [...body.subjectIds];
    if (body.targetIds.length > 0) {
      const matchedSubjects = await this.db
        .select({ id: qbSubjects.id })
        .from(qbSubjects)
        .where(inArray(qbSubjects.targetId, body.targetIds));
      for (const subject of matchedSubjects) subjectIds.push(subject.id);
    }

    const hierarchyConditions: SQL[] = [];
    if (subjectIds.length > 0 || body.chapterIds.length > 0) {
      let chapterIds: string[] = [...body.chapterIds];
      if (subjectIds.length > 0) {
        const subjectChapters = await this.db
          .select({ id: qbChapters.id })
          .from(qbChapters)
          .where(inArray(qbChapters.subjectId, subjectIds));
        chapterIds = [...new Set([...chapterIds, ...subjectChapters.map((c) => c.id)])];
      }
      if (chapterIds.length > 0) {
        hierarchyConditions.push(
          inArray(
            qbQuestions.topicId,
            this.db
              .select({ id: qbTopics.id })
              .from(qbTopics)
              .where(inArray(qbTopics.chapterId, chapterIds)),
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
      const matched = await this.db
        .selectDistinct({ questionId: qbExamSheetQuestions.questionId })
        .from(qbExamSheetQuestions)
        .where(inArray(qbExamSheetQuestions.examSheetId, body.examSheetIds));
      const matchedIds = matched.map((m) => m.questionId);
      scopedConditions.push(matchedIds.length > 0 ? inArray(qbQuestions.id, matchedIds) : sql`false`);
    }

    if (body.sourceIds.length > 0 || body.sourceTypes.length > 0) {
      const sourceConditions: SQL[] = [];
      if (body.sourceIds.length > 0) sourceConditions.push(inArray(qbSources.id, body.sourceIds));
      if (body.sourceTypes.length > 0) {
        sourceConditions.push(inArray(qbSources.type, body.sourceTypes));
      }
      const matched = await this.db
        .selectDistinct({ questionId: qbQuestionSources.questionId })
        .from(qbQuestionSources)
        .innerJoin(qbSources, eq(qbQuestionSources.sourceId, qbSources.id))
        .where(or(...sourceConditions));
      const matchedIds = matched.map((m) => m.questionId);
      scopedConditions.push(matchedIds.length > 0 ? inArray(qbQuestions.id, matchedIds) : sql`false`);
    }

    let sampledQuestionIds: string[] = [];

    if (examType === 'mixed') {
      const mcqCountRequested = Math.min(Math.max(Number(body.mcqCount) || 10, 1), 100);
      const writtenCountRequested = Math.min(Math.max(Number(body.writtenCount) || 2, 1), 50);

      const candidates = await this.db
        .select({ id: qbQuestions.id, qType: qbQuestions.qType })
        .from(qbQuestions)
        .where(
          and(
            eq(qbQuestions.status, 'published'),
            inArray(qbQuestions.qType, ['mcq', 'written']),
            ...scopedConditions,
          ),
        );

      const mcqPool = candidates.filter((row) => row.qType === 'mcq').map((row) => row.id);
      const writtenPool = candidates.filter((row) => row.qType === 'written').map((row) => row.id);

      sampledQuestionIds = [
        ...mcqPool.sort(() => Math.random() - 0.5).slice(0, mcqCountRequested),
        ...writtenPool.sort(() => Math.random() - 0.5).slice(0, writtenCountRequested),
      ];
    } else {
      const typeCondition =
        examType === 'written' ? eq(qbQuestions.qType, 'written') : eq(qbQuestions.qType, 'mcq');

      const candidateRows = await this.db
        .select({ id: qbQuestions.id })
        .from(qbQuestions)
        .where(and(typeCondition, eq(qbQuestions.status, 'published'), ...scopedConditions))
        .limit(1000);

      sampledQuestionIds = candidateRows
        .map((row) => row.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, countRequested);
    }

    if (sampledQuestionIds.length === 0) {
      throw ApiError.badRequest('No questions available for this selection');
    }

    const examId = uuidv7();
    const examTitle =
      body.title?.trim() || `কাস্টম পরীক্ষা (${new Date().toLocaleDateString('bn-BD')})`;

    await this.db.insert(qbCustomExams).values({
      id: examId,
      userId,
      title: examTitle,
      examType,
      questionCount: sampledQuestionIds.length,
      durationMinutes,
      negativeMarks,
      totalMarks: String(sampledQuestionIds.length),
      config: JSON.stringify({
        targetIds: body.targetIds,
        subjectIds: body.subjectIds,
        chapterIds: body.chapterIds,
        topicIds: body.topicIds,
        sourceIds: body.sourceIds,
        sourceTypes: body.sourceTypes,
      }),
    });

    await this.db.insert(qbCustomExamQuestions).values(
      sampledQuestionIds.map((questionId, index) => ({
        customExamId: examId,
        questionId,
        questionNumber: index + 1,
      })),
    );

    return {
      id: examId,
      title: examTitle,
      questionCount: sampledQuestionIds.length,
      durationMinutes,
    };
  }

  async getTakeSession(examId: string) {
    const exam = await this.db.query.qbCustomExams.findFirst({
      where: eq(qbCustomExams.id, examId),
    });

    if (!exam) {
      throw ApiError.notFound('Exam not found');
    }

    const examQuestionRows = await this.db.query.qbCustomExamQuestions.findMany({
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

    return {
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
      questions: examQuestionRows.map((row) =>
        mapQuestion(row.question as never, { includeAnswers: false }),
      ),
    };
  }

  async submitCustomExam(
    examId: string,
    body: SubmitCustomExamDto,
    userId: string | null,
  ) {
    const exam = await this.db.query.qbCustomExams.findFirst({
      where: eq(qbCustomExams.id, examId),
    });

    if (!exam) {
      throw ApiError.notFound('Exam not found');
    }

    const examQuestionRows = await this.db.query.qbCustomExamQuestions.findMany({
      where: eq(qbCustomExamQuestions.customExamId, examId),
      with: { question: { with: { options: true, parts: true } } },
    });

    const userAnswers = body.answers || {};
    const negPenalty = Number.parseFloat(exam.negativeMarks) || 0.25;

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    let mcqScore = 0;

    for (const examQuestion of examQuestionRows) {
      const question = examQuestion.question;
      if (question.qType !== 'mcq') continue;

      const studentChoice = userAnswers[question.id];
      if (!studentChoice) {
        unansweredCount++;
        continue;
      }

      const correctOption = question.options.find((option) => option.isCorrect);
      if (correctOption && correctOption.id === studentChoice) {
        correctCount++;
        mcqScore += 1;
      } else {
        wrongCount++;
        mcqScore -= negPenalty;
      }
    }

    const finalScore = Math.max(0, mcqScore);
    const hasWritten = exam.examType === 'written' || exam.examType === 'mixed';
    const submissionStatus = hasWritten ? 'pending_evaluation' : 'auto_evaluated';
    const submissionId = uuidv7();

    await this.db.insert(qbCustomExamSubmissions).values({
      id: submissionId,
      customExamId: examId,
      userId,
      status: submissionStatus,
      score: finalScore.toFixed(2),
      writtenScore: '0',
      writtenTotalMarks: '0',
      correctCount,
      wrongCount,
      unansweredCount,
      timeSpentSeconds: Number(body.timeSpentSeconds) || 0,
      answers: JSON.stringify(userAnswers),
    });

    if (body.writtenAnswers && body.writtenAnswers.length > 0) {
      await this.db.insert(qbCustomExamWrittenSubmissions).values(
        body.writtenAnswers.map((written) => ({
          id: uuidv7(),
          submissionId,
          questionId: written.questionId,
          partId: written.partId ?? null,
          pageNumber: written.pageNumber || 1,
          imageUrl: written.imageUrl,
        })),
      );
    }

    return {
      id: submissionId,
      customExamId: examId,
      status: submissionStatus,
      score: finalScore.toFixed(2),
      correctCount,
      wrongCount,
      unansweredCount,
    };
  }

  async getSolution(examId: string, submissionId?: string) {
    const exam = await this.db.query.qbCustomExams.findFirst({
      where: eq(qbCustomExams.id, examId),
    });

    if (!exam) {
      throw ApiError.notFound('Exam not found');
    }

    const submissionRow = submissionId
      ? await this.db.query.qbCustomExamSubmissions.findFirst({
          where: and(
            eq(qbCustomExamSubmissions.id, submissionId),
            eq(qbCustomExamSubmissions.customExamId, examId),
          ),
        })
      : await this.db.query.qbCustomExamSubmissions.findFirst({
          where: eq(qbCustomExamSubmissions.customExamId, examId),
          orderBy: [desc(qbCustomExamSubmissions.submittedAt)],
        });

    const examQuestionRows = await this.db.query.qbCustomExamQuestions.findMany({
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
        studentAnswers =
          typeof submissionRow.answers === 'string'
            ? JSON.parse(submissionRow.answers)
            : ((submissionRow.answers as Record<string, string>) ?? {});
      } catch {
        studentAnswers = {};
      }
    }

    const writtenSubmissionRows = submissionRow
      ? await this.db.query.qbCustomExamWrittenSubmissions.findMany({
          where: eq(qbCustomExamWrittenSubmissions.submissionId, submissionRow.id),
          orderBy: [asc(qbCustomExamWrittenSubmissions.pageNumber)],
        })
      : [];

    return {
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
      questions: examQuestionRows.map((row) =>
        mapQuestion(row.question as never, { includeAnswers: true }),
      ),
      studentAnswers,
      writtenSubmissions: writtenSubmissionRows.map((written) => ({
        id: written.id,
        questionId: written.questionId,
        partId: written.partId,
        pageNumber: written.pageNumber,
        imageUrl: written.imageUrl,
        annotatedImageUrl: written.annotatedImageUrl,
        marksAwarded: written.marksAwarded,
        maxMarks: written.maxMarks,
        feedback: written.feedback,
      })),
    };
  }
}
