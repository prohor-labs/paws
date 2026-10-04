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
        SELECT COUNT(DISTINCT qc.question_id)
        FROM public.qb_question_chapters qc
        JOIN public.qb_chapters ch ON ch.id = qc.chapter_id
        JOIN public.qb_question_sources qs ON qs.question_id = qc.question_id
        JOIN public.qb_sources src ON src.id = qs.source_id
        JOIN public.qb_containers cont ON cont.id = ci.container_id
        JOIN public.qb_targets targ ON targ.id = cont.target_id
        JOIN public.qb_questions q ON q.id = qc.question_id
        WHERE ch.subject_id = ci.subject_id
          AND q.status = 'published'
          AND (
            (targ.slug = 'medical' AND src.type = 'medical') OR
            (targ.slug = 'engineering' AND src.type = 'engineering') OR
            (targ.slug IN ('general', 'varsity') AND src.type = 'university') OR
            (targ.slug IN ('hsc-science', 'hsc-general', 'academic') AND src.type = 'board') OR
            (targ.slug NOT IN ('medical', 'engineering', 'general', 'varsity', 'hsc-science', 'hsc-general', 'academic'))
          )
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
        SELECT SUM(c.question_count)
        FROM public.qb_containers c
        WHERE c.target_id = t.id
      ), 0),
      subject_count = COALESCE((
        SELECT COUNT(DISTINCT ci.subject_id)
        FROM public.qb_containers c
        JOIN public.qb_container_items ci ON ci.container_id = c.id
        WHERE c.target_id = t.id AND ci.subject_id IS NOT NULL
      ), 0);
  `);
}
