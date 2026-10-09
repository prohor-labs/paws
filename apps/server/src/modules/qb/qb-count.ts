import { sql } from 'drizzle-orm';
import type { Database } from '../../common/database/drizzle.service.js';

export async function recalculateAllCounts(db: Database): Promise<void> {
  await db.execute(
    sql`ALTER TABLE public.qb_targets ADD COLUMN IF NOT EXISTS subject_count INTEGER NOT NULL DEFAULT 0;`,
  );
  await db.execute(
    sql`ALTER TABLE public.qb_targets ADD COLUMN IF NOT EXISTS question_count INTEGER NOT NULL DEFAULT 0;`,
  );
  await db.execute(
    sql`ALTER TABLE public.qb_subjects ADD COLUMN IF NOT EXISTS chapter_count INTEGER NOT NULL DEFAULT 0;`,
  );
  await db.execute(
    sql`ALTER TABLE public.qb_subjects ADD COLUMN IF NOT EXISTS question_count INTEGER NOT NULL DEFAULT 0;`,
  );
  await db.execute(
    sql`ALTER TABLE public.qb_chapters ADD COLUMN IF NOT EXISTS question_count INTEGER NOT NULL DEFAULT 0;`,
  );
  await db.execute(
    sql`ALTER TABLE public.qb_topics ADD COLUMN IF NOT EXISTS question_count INTEGER NOT NULL DEFAULT 0;`,
  );
  await db.execute(
    sql`ALTER TABLE public.qb_sources ADD COLUMN IF NOT EXISTS question_count INTEGER NOT NULL DEFAULT 0;`,
  );

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
      SELECT COUNT(*)
      FROM public.qb_questions q
      INNER JOIN public.qb_topics t ON t.id = q.topic_id
      WHERE t.chapter_id = c.id AND q.status = 'published'
    ), 0);
  `);

  await db.execute(sql`
    UPDATE public.qb_subjects s
    SET
      question_count = COALESCE((
        SELECT COUNT(*)
        FROM public.qb_questions q
        INNER JOIN public.qb_topics t ON t.id = q.topic_id
        INNER JOIN public.qb_chapters c ON c.id = t.chapter_id
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
      question_count = CASE
        WHEN ci.subject_id IS NOT NULL AND ci.slug = 'all' THEN
          COALESCE((
            SELECT COUNT(DISTINCT q.id)
            FROM public.qb_questions q
            JOIN public.qb_topics top ON top.id = q.topic_id
            JOIN public.qb_chapters ch ON ch.id = top.chapter_id
            WHERE ch.subject_id = ci.subject_id AND q.status = 'published'
          ), 0)
        WHEN ci.subject_id IS NOT NULL THEN
          COALESCE((
            SELECT COUNT(DISTINCT q.id)
            FROM public.qb_questions q
            JOIN public.qb_topics top ON top.id = q.topic_id
            JOIN public.qb_chapters ch ON ch.id = top.chapter_id
            WHERE ch.subject_id = ci.subject_id AND (ch.slug = ci.slug OR ch.name = ci.name) AND q.status = 'published'
          ), 0)
        ELSE
          COALESCE((
            SELECT COUNT(DISTINCT qs.question_id)
            FROM public.qb_question_sources qs
            JOIN public.qb_sources src ON src.id = qs.source_id
            WHERE src.container_item_id = ci.id
          ), 0) + COALESCE((
            SELECT COUNT(DISTINCT esq.question_id)
            FROM public.qb_exam_sheets es
            JOIN public.qb_exam_sheet_questions esq ON esq.exam_sheet_id = es.id
            WHERE es.container_item_id = ci.id
          ), 0)
      END,
      exam_sheet_count = COALESCE((
        SELECT COUNT(*)
        FROM public.qb_exam_sheets es
        WHERE es.container_item_id = ci.id
      ), 0);
  `);

  await db.execute(sql`
    UPDATE public.qb_containers c
    SET
      question_count = CASE
        WHEN c.target_id IN (SELECT id FROM public.qb_targets WHERE slug IN ('hsc-academic', 'ssc-academic')) THEN
          COALESCE((
            SELECT COUNT(DISTINCT q.id)
            FROM public.qb_questions q
            JOIN public.qb_topics top ON top.id = q.topic_id
            JOIN public.qb_chapters ch ON ch.id = top.chapter_id
            JOIN public.qb_subjects s ON s.id = ch.subject_id
            WHERE s.target_id = c.target_id AND (s.slug = c.slug OR s.name = c.name) AND q.status = 'published'
          ), 0)
        ELSE
          COALESCE((
            SELECT COUNT(DISTINCT qs.question_id)
            FROM public.qb_question_sources qs
            JOIN public.qb_sources src ON src.id = qs.source_id
            WHERE src.container_id = c.id
          ), 0)
      END,
      item_count = COALESCE((
        SELECT COUNT(*)
        FROM public.qb_container_items ci
        WHERE ci.container_id = c.id
      ), 0);
  `);

  await db.execute(sql`
    UPDATE public.qb_targets t
    SET
      question_count = GREATEST(
        COALESCE((
          SELECT COUNT(DISTINCT q.id)
          FROM public.qb_questions q
          JOIN public.qb_topics top ON top.id = q.topic_id
          JOIN public.qb_chapters ch ON ch.id = top.chapter_id
          JOIN public.qb_subjects s ON s.id = ch.subject_id
          WHERE s.target_id = t.id AND q.status = 'published'
        ), 0),
        COALESCE((
          SELECT COUNT(DISTINCT qs.question_id)
          FROM public.qb_question_sources qs
          JOIN public.qb_sources src ON src.id = qs.source_id
          JOIN public.qb_containers c ON c.id = src.container_id
          WHERE c.target_id = t.id
        ), 0)
      ),
      subject_count = COALESCE((
        SELECT COUNT(*)
        FROM public.qb_subjects s
        WHERE s.target_id = t.id
      ), 0);
  `);
}
