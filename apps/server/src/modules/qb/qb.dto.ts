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

export const chapterQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(100),
  topicId: z.string().optional(),
  sourceId: z.string().optional(),
  sourceSlug: z.string().optional(),
  source: z.string().optional(),
  examSheetId: z.string().optional(),
  examSheetSlug: z.string().optional(),
  examSheet: z.string().optional(),
  subjectSlug: z.string().optional(),
  chapterSlug: z.string().optional(),
  targetSlug: z.string().optional(),
  containerSlug: z.string().optional(),
  itemSlug: z.string().optional(),
  container: z.string().optional(),
  item: z.string().optional(),
  sourceType: sourceTypeSchema.optional(),
  qType: z.enum(['mcq', 'written']).optional(),
});

export const bulkImportSchema = z.object({
  subjectId: z.string(),
  chapterId: z.string(),
  sourceId: z.string().optional(),
  topics: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string().optional(),
        parentId: z.string().nullable().optional(),
        parentTopicId: z.string().nullable().optional(),
        orderIndex: z.number().optional(),
      }),
    )
    .optional(),
  questions: z.array(
    z.object({
      id: z.string().optional(),
      qType: z.enum(['mcq', 'written']).default('mcq'),
      questionText: z.string(),
      contextText: z.string().nullable().optional(),
      explanation: z.string().nullable().optional(),
      topicId: z.string().nullable().optional(),
      sourceId: z.string().nullable().optional(),
      orderIndex: z.number().optional(),
      options: z
        .array(
          z.object({
            id: z.string().optional(),
            optionText: z.string(),
            isCorrect: z.boolean().default(false),
            orderIndex: z.number().optional(),
          }),
        )
        .optional(),
      parts: z
        .array(
          z.object({
            id: z.string().optional(),
            partText: z.string(),
            answerText: z.string().nullable().optional(),
            marks: z.number().optional().default(5),
            orderIndex: z.number().optional(),
          }),
        )
        .optional(),
    }),
  ),
});

export type ChapterQueryDto = z.infer<typeof chapterQuerySchema>;
export type BulkImportDto = z.infer<typeof bulkImportSchema>;
