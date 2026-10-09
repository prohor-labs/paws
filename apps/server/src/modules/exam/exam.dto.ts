import { z } from 'zod';

export const sourceTypeSchema = z.enum([
  'board',
  'university',
  'medical',
  'engineering',
  'bcs',
  'bank_job',
  'model_test',
  'other',
]);

export const createCustomExamSchema = z.object({
  title: z.string().optional(),
  examType: z.enum(['mcq', 'written', 'mixed']).optional().default('mcq'),
  questionCount: z.number().optional().default(10),
  mcqCount: z.number().optional(),
  writtenCount: z.number().optional(),
  durationMinutes: z.number().optional(),
  negativeMarks: z.string().optional().default('0.25'),
  targetIds: z.array(z.string()).optional().default([]),
  subjectIds: z.array(z.string()).optional().default([]),
  chapterIds: z.array(z.string()).optional().default([]),
  topicIds: z.array(z.string()).optional().default([]),
  examSheetIds: z.array(z.string()).optional().default([]),
  sourceIds: z.array(z.string()).optional().default([]),
  sourceTypes: z.array(sourceTypeSchema).optional().default([]),
});

export const submitCustomExamSchema = z.object({
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
});

export const solveCustomExamQuerySchema = z.object({
  submissionId: z.string().optional(),
});

export type CreateCustomExamDto = z.infer<typeof createCustomExamSchema>;
export type SubmitCustomExamDto = z.infer<typeof submitCustomExamSchema>;
export type SolveCustomExamQueryDto = z.infer<typeof solveCustomExamQuerySchema>;
