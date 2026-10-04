import { sql } from "drizzle-orm";
import { db } from "../db";

export async function recalculateAllCounts(): Promise<void> {
  await db.execute(sql`ALTER TABLE public.qb_targets ADD COLUMN IF NOT EXISTS subject_count INTEGER NOT NULL DEFAULT 0;`);
  await db.execute(sql`ALTER TABLE public.qb_targets ADD COLUMN IF NOT EXISTS question_count INTEGER NOT NULL DEFAULT 0;`);
  await db.execute(sql`ALTER TABLE public.qb_subjects ADD COLUMN IF NOT EXISTS chapter_count INTEGER NOT NULL DEFAULT 0;`);
  await db.execute(sql`ALTER TABLE public.qb_subjects ADD COLUMN IF NOT EXISTS question_count INTEGER NOT NULL DEFAULT 0;`);
  await db.execute(sql`ALTER TABLE public.qb_chapters ADD COLUMN IF NOT EXISTS question_count INTEGER NOT NULL DEFAULT 0;`);
  await db.execute(sql`ALTER TABLE public.qb_topics ADD COLUMN IF NOT EXISTS question_count INTEGER NOT NULL DEFAULT 0;`);
  await db.execute(sql`ALTER TABLE public.qb_sources ADD COLUMN IF NOT EXISTS question_count INTEGER NOT NULL DEFAULT 0;`);

  await db.execute(sql`
    UPDATE public.qb_topics t
    SET question_count = COALESCE((
      SELECT COUNT(*)
      FROM public.qb_questions q
      WHERE q.topic_id = t.id AND q.status = 'published'
    ), 0);
  `);

  await db.execute(sql`
    UPDATE public.qb_sources s
    SET question_count = COALESCE((
      SELECT COUNT(DISTINCT qs.question_id)
      FROM public.qb_question_sources qs
      INNER JOIN public.qb_questions q ON q.id = qs.question_id
      WHERE qs.source_id = s.id AND q.status = 'published'
    ), 0);
  `);

  await db.execute(sql`
    UPDATE public.qb_chapters c
    SET question_count = COALESCE((
      SELECT COUNT(DISTINCT qc.question_id)
      FROM public.qb_question_chapters qc
      INNER JOIN public.qb_questions q ON q.id = qc.question_id
      WHERE qc.chapter_id = c.id AND q.status = 'published'
    ), 0);
  `);

  await db.execute(sql`
    UPDATE public.qb_subjects s
    SET 
      question_count = COALESCE((
        SELECT COUNT(DISTINCT qc.question_id)
        FROM public.qb_question_chapters qc
        INNER JOIN public.qb_questions q ON q.id = qc.question_id
        INNER JOIN public.qb_chapters c ON c.id = qc.chapter_id
        WHERE c.subject_id = s.id AND q.status = 'published'
      ), 0),
      chapter_count = COALESCE((
        SELECT COUNT(*)
        FROM public.qb_chapters c
        WHERE c.subject_id = s.id
      ), 0);
  `);

  await db.execute(sql`
    UPDATE public.qb_exam_sheets es
    SET question_count = COALESCE((
      SELECT COUNT(DISTINCT esq.question_id)
      FROM public.qb_exam_sheet_questions esq
      INNER JOIN public.qb_questions q ON q.id = esq.question_id
      WHERE esq.exam_sheet_id = es.id AND q.status = 'published'
    ), 0);
  `);

  await db.execute(sql`
    UPDATE public.qb_container_items ci
    SET 
      question_count = COALESCE((
        SELECT SUM(es.question_count)
        FROM public.qb_exam_sheets es
        WHERE es.container_item_id = ci.id
      ), 0) + COALESCE((
        SELECT s.question_count
        FROM public.qb_subjects s
        WHERE s.id = ci.subject_id
      ), 0),
      exam_sheet_count = COALESCE((
        SELECT COUNT(*)
        FROM public.qb_exam_sheets es
        WHERE es.container_item_id = ci.id
      ), 0);
  `);

  await db.execute(sql`
    UPDATE public.qb_containers c
    SET 
      question_count = COALESCE((
        SELECT SUM(ci.question_count)
        FROM public.qb_container_items ci
        WHERE ci.container_id = c.id
      ), 0),
      item_count = COALESCE((
        SELECT COUNT(*)
        FROM public.qb_container_items ci
        WHERE ci.container_id = c.id
      ), 0);
  `);

  await db.execute(sql`
    UPDATE public.qb_targets t
    SET 
      question_count = COALESCE((
        SELECT COALESCE(SUM(s.question_count), 0)
        FROM public.qb_subjects s
        WHERE s.target_id = t.id
      ), 0) + COALESCE((
        SELECT COALESCE(SUM(c.question_count), 0)
        FROM public.qb_containers c
        WHERE c.target_id = t.id
      ), 0),
      subject_count = COALESCE((
        SELECT COUNT(*)
        FROM public.qb_subjects s
        WHERE s.target_id = t.id
      ), 0);
  `);
}
