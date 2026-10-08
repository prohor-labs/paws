import { examRoute } from "./exam";
import { zValidator } from "@hono/zod-validator";
import {
  and,
  asc,
  count,
  desc,
  eq,
  inArray,
  like,
  not,
  notInArray,
  or,
  type SQL,
  sql,
} from "drizzle-orm";
import { Hono } from "hono";
import { v7 as uuidv7 } from "uuid";
import { z } from "zod";
import { db } from "../db";
import {
  qbChapterSources,
  qbChapters,
  qbContainerItems,
  qbContainers,
  qbCustomExamQuestions,
  qbCustomExamSubmissions,
  qbCustomExams,
  qbCustomExamWrittenSubmissions,
  qbExamSheetQuestions,
  qbExamSheets,

  qbQuestionOptions,
  qbQuestionParts,
  qbQuestionSources,
  qbQuestions,
  qbSources,
  qbSubjects,
  qbTargets,
  qbTopics,
} from "../db/schema";
import { cleanAndFormatMathText } from "../lib/math";
import type { AuthContextVariables } from "../middleware/auth.middleware";
import { recalculateAllCounts } from "../services/qb-count.service";

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

const CACHE_CONTROL_PUBLIC = "public, s-maxage=300, stale-while-revalidate=3600";
const CACHE_CONTROL_PRIVATE = "private, no-store";

const selectTargetBySlug = db
  .select()
  .from(qbTargets)
  .where(eq(qbTargets.slug, sql.placeholder("slug")))
  .prepare("qb_target_by_slug");

const selectTargetById = db
  .select()
  .from(qbTargets)
  .where(eq(qbTargets.id, sql.placeholder("id")))
  .prepare("qb_target_by_id");

const selectSubjectBySlug = db
  .select()
  .from(qbSubjects)
  .where(eq(qbSubjects.slug, sql.placeholder("slug")))
  .prepare("qb_subject_by_slug");

const selectChapterBySubjectSlug = db
  .select()
  .from(qbChapters)
  .where(
    and(
      eq(qbChapters.subjectId, sql.placeholder("subjectId")),
      eq(qbChapters.slug, sql.placeholder("slug")),
    ),
  )
  .prepare("qb_chapter_by_subject_slug");

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

export const qbRoute = new Hono<{ Variables: AuthContextVariables }>()
  .post("/recalculate", async (c) => {
    await recalculateAllCounts();
    return c.json({
      success: true,
      message: "Recalculated all question and entity counts successfully",
    });
  })
  .get("/recalculate", async (c) => {
    await recalculateAllCounts();
    return c.json({
      success: true,
      message: "Recalculated all question and entity counts successfully",
    });
  })
  .get("/hub", async (c) => {
    const [targetsList, sourcesList] = await Promise.all([
      db.select().from(qbTargets).orderBy(asc(qbTargets.orderIndex)),
      db.select().from(qbSources).orderBy(desc(qbSources.year), asc(qbSources.name)),
    ]);

    const targets = targetsList.map((t) => ({
      id: t.id,
      group: t.group,
      name: t.name,
      slug: t.slug,
      orderIndex: t.orderIndex,
      subjectCount: t.subjectCount,
      questionCount: t.questionCount,
    }));

    c.header("Cache-Control", CACHE_CONTROL_PUBLIC);
    return c.json({ success: true, data: { targets, sources: sourcesList } });
  })
  .get("/targets/:slug", async (c) => {
    const slug = c.req.param("slug");

    const [target] = await selectTargetBySlug.execute({ slug });

    if (!target) {
      return c.json({ success: false, error: "Target not found" }, 404);
    }

    const [containers, subjects] = await Promise.all([
      db
        .select()
        .from(qbContainers)
        .where(eq(qbContainers.targetId, target.id))
        .orderBy(asc(qbContainers.orderIndex)),
      db
        .select()
        .from(qbSubjects)
        .where(eq(qbSubjects.targetId, target.id))
        .orderBy(asc(qbSubjects.orderIndex)),
    ]);

    c.header("Cache-Control", CACHE_CONTROL_PUBLIC);
    return c.json({
      success: true,
      data: {
        target: {
          id: target.id,
          group: target.group,
          name: target.name,
          slug: target.slug,
          orderIndex: target.orderIndex,
        },
        containers: containers.map((ct) => ({
          id: ct.id,
          targetId: ct.targetId,
          name: ct.name,
          slug: ct.slug,
          description: ct.description,
          iconUrl: ct.iconUrl,
          orderIndex: ct.orderIndex,
          itemCount: ct.itemCount,
          questionCount: ct.questionCount,
        })),
        subjects: subjects.map((s) => ({
          id: s.id,
          targetId: s.targetId,
          name: s.name,
          slug: s.slug,
          code: s.code,
          orderIndex: s.orderIndex,
          chapterCount: s.chapterCount,
          questionCount: s.questionCount,
        })),
      },
    });
  })
  .get("/targets/:targetSlug/containers/:containerSlug", async (c) => {
    const targetSlug = c.req.param("targetSlug");
    const containerSlug = c.req.param("containerSlug");

    const [target] = await selectTargetBySlug.execute({ slug: targetSlug });
    if (!target) {
      return c.json({ success: false, error: "Target not found" }, 404);
    }

    let container = await db.query.qbContainers.findFirst({
      where: and(eq(qbContainers.targetId, target.id), eq(qbContainers.slug, containerSlug)),
    });

    if (!container) {
      // Check if containerSlug matches an item under any of this target's containers
      const matchingItem = await db
        .select({
          containerId: qbContainerItems.containerId,
        })
        .from(qbContainerItems)
        .innerJoin(qbContainers, eq(qbContainerItems.containerId, qbContainers.id))
        .where(and(eq(qbContainers.targetId, target.id), eq(qbContainerItems.slug, containerSlug)))
        .limit(1);

      if (matchingItem[0]) {
        container = await db.query.qbContainers.findFirst({
          where: eq(qbContainers.id, matchingItem[0].containerId),
        });
      }
    }

    if (!container) {
      return c.json({ success: false, error: "Container not found" }, 404);
    }

    const items = await db
      .select()
      .from(qbContainerItems)
      .where(eq(qbContainerItems.containerId, container.id))
      .orderBy(asc(qbContainerItems.orderIndex));

    c.header("Cache-Control", CACHE_CONTROL_PUBLIC);
    return c.json({
      success: true,
      data: {
        target: {
          id: target.id,
          group: target.group,
          name: target.name,
          slug: target.slug,
          orderIndex: target.orderIndex,
        },
        container: {
          id: container.id,
          targetId: container.targetId,
          name: container.name,
          slug: container.slug,
          description: container.description,
          iconUrl: container.iconUrl,
          orderIndex: container.orderIndex,
          itemCount: container.itemCount,
          questionCount: container.questionCount,
        },
        items: items.map((it) => ({
          id: it.id,
          containerId: it.containerId,
          subjectId: it.subjectId,
          name: it.name,
          slug: it.slug,
          description: it.description,
          iconUrl: it.iconUrl,
          orderIndex: it.orderIndex,
          examSheetCount: it.examSheetCount,
          questionCount: it.questionCount,
        })),
      },
    });
  })
  .get("/targets/:targetSlug/containers/:containerSlug/items/:itemSlug", async (c) => {
    const targetSlug = c.req.param("targetSlug");
    const containerSlug = c.req.param("containerSlug");
    const itemSlug = c.req.param("itemSlug");

    const [target] = await selectTargetBySlug.execute({ slug: targetSlug });
    if (!target) {
      return c.json({ success: false, error: "Target not found" }, 404);
    }

    let container = await db.query.qbContainers.findFirst({
      where: and(eq(qbContainers.targetId, target.id), eq(qbContainers.slug, containerSlug)),
    });

    if (!container) {
      const matchingItem = await db
        .select({
          containerId: qbContainerItems.containerId,
        })
        .from(qbContainerItems)
        .innerJoin(qbContainers, eq(qbContainerItems.containerId, qbContainers.id))
        .where(
          and(
            eq(qbContainers.targetId, target.id),
            or(eq(qbContainerItems.slug, itemSlug), eq(qbContainerItems.slug, containerSlug)),
          ),
        )
        .limit(1);

      if (matchingItem[0]) {
        container = await db.query.qbContainers.findFirst({
          where: eq(qbContainers.id, matchingItem[0].containerId),
        });
      }
    }

    if (!container) {
      return c.json({ success: false, error: "Container not found" }, 404);
    }

    let item = await db.query.qbContainerItems.findFirst({
      where: and(
        eq(qbContainerItems.containerId, container.id),
        eq(qbContainerItems.slug, itemSlug),
      ),
    });

    if (!item) {
      item = await db.query.qbContainerItems.findFirst({
        where: and(
          eq(qbContainerItems.containerId, container.id),
          eq(qbContainerItems.slug, containerSlug),
        ),
      });
    }

    if (!item) {
      return c.json({ success: false, error: "Item not found" }, 404);
    }

    let subject = item.subjectId
      ? await db.query.qbSubjects.findFirst({
          where: eq(qbSubjects.id, item.subjectId),
        })
      : null;

    if (!subject) {
      subject = await db.query.qbSubjects.findFirst({
        where: eq(qbSubjects.slug, itemSlug),
      });
    }

    let chapters = subject
      ? await db
          .select()
          .from(qbChapters)
          .where(eq(qbChapters.subjectId, subject.id))
          .orderBy(asc(qbChapters.orderIndex))
      : await db
          .select()
          .from(qbChapters)
          .where(eq(qbChapters.containerItemId, item.id))
          .orderBy(asc(qbChapters.orderIndex));

    const targetSourceTypeMap: Record<string, "medical" | "engineering" | "university" | "board"> =
      {
        medical: "medical",
        engineering: "engineering",
        general: "university",
        varsity: "university",
        "hsc-science": "board",
        "hsc-general": "board",
      };
    const targetSourceType = targetSourceTypeMap[target.slug];

    if (subject && targetSourceType && chapters.length > 0) {
      const chIds = chapters.map((c) => c.id);
      const scopedChapterCounts = await db
        .select({
          chapterId: qbTopics.chapterId,
          total: count(qbQuestions.id),
        })
        .from(qbQuestions)
        .innerJoin(qbTopics, eq(qbTopics.id, qbQuestions.topicId))
        .innerJoin(
          qbQuestionSources,
          eq(qbQuestionSources.questionId, qbQuestions.id),
        )
        .innerJoin(
          qbSources,
          and(eq(qbSources.id, qbQuestionSources.sourceId), eq(qbSources.type, targetSourceType)),
        )
        .where(
          and(
            inArray(qbTopics.chapterId, chIds),
            eq(qbQuestions.status, "published"),
          ),
        )
        .groupBy(qbTopics.chapterId);

      const scopedMap = new Map(scopedChapterCounts.map((sc) => [sc.chapterId, Number(sc.total)]));
      chapters = chapters.map((ch) => ({
        ...ch,
        questionCount: scopedMap.get(ch.id) ?? 0,
      }));
    }


    const examSheets = await db
      .select()
      .from(qbExamSheets)
      .where(eq(qbExamSheets.containerItemId, item.id))
      .orderBy(asc(qbExamSheets.orderIndex), asc(qbExamSheets.title));

    if (chapters.length === 0 && examSheets.length > 0) {
      const esIds = examSheets.map((es) => es.id);
      const qChapters = await db
        .select({
          chapterId: qbTopics.chapterId,
          qCount: count(qbExamSheetQuestions.questionId),
        })
        .from(qbExamSheetQuestions)
        .innerJoin(qbQuestions, eq(qbQuestions.id, qbExamSheetQuestions.questionId))
        .innerJoin(qbTopics, eq(qbTopics.id, qbQuestions.topicId))
        .where(inArray(qbExamSheetQuestions.examSheetId, esIds))
        .groupBy(qbTopics.chapterId);

      const chMap = new Map(qChapters.map((qc) => [qc.chapterId, Number(qc.qCount)]));
      const chIds = qChapters.map((qc) => qc.chapterId).filter((id): id is string => id !== null);

      if (chIds.length > 0) {
        const foundChapters = await db
          .select()
          .from(qbChapters)
          .where(inArray(qbChapters.id, chIds))
          .orderBy(asc(qbChapters.orderIndex), asc(qbChapters.name));

        chapters = foundChapters.map((ch) => ({
          ...ch,
          questionCount: chMap.get(ch.id) ?? ch.questionCount,
        }));
      }
    }


    c.header("Cache-Control", CACHE_CONTROL_PUBLIC);
    return c.json({
      success: true,
      data: {
        target: {
          id: target.id,
          group: target.group,
          name: target.name,
          slug: target.slug,
          orderIndex: target.orderIndex,
        },
        container: {
          id: container.id,
          targetId: container.targetId,
          name: container.name,
          slug: container.slug,
          description: container.description,
          iconUrl: container.iconUrl,
          orderIndex: container.orderIndex,
        },
        item: {
          id: item.id,
          containerId: item.containerId,
          subjectId: item.subjectId,
          name: item.name,
          slug: item.slug,
          description: item.description,
          iconUrl: item.iconUrl,
          orderIndex: item.orderIndex,
          examSheetCount: item.examSheetCount,
          questionCount: item.questionCount,
        },
        subject: subject
          ? {
              id: subject.id,
              targetId: subject.targetId,
              name: subject.name,
              slug: subject.slug,
              code: subject.code,
              orderIndex: subject.orderIndex,
            }
          : null,
        chapters: chapters.map((ch) => ({
          id: ch.id,
          subjectId: ch.subjectId,
          containerItemId: ch.containerItemId,
          name: ch.name,
          slug: ch.slug,
          orderIndex: ch.orderIndex,
          topicCount: ch.topicCount,
          questionCount: ch.questionCount,
        })),
        examSheets: examSheets.map((es) => ({
          id: es.id,
          containerItemId: es.containerItemId,
          chapterId: es.chapterId,
          title: es.title,
          slug: es.slug,
          examType: es.examType,
          durationMinutes: es.durationMinutes,
          totalMarks: es.totalMarks,
          negativeMarks: es.negativeMarks,
          orderIndex: es.orderIndex,
          questionCount: es.questionCount,
        })),
      },
    });
  })
  .get("/subjects/:slug", async (c) => {
    const slug = c.req.param("slug");

    const [subject] = await selectSubjectBySlug.execute({ slug });

    if (!subject) {
      return c.json({ success: false, error: "Subject not found" }, 404);
    }

    const [target] = subject.targetId
      ? await selectTargetById.execute({ id: subject.targetId })
      : [];

    const chapters = await db
      .select()
      .from(qbChapters)
      .where(eq(qbChapters.subjectId, subject.id))
      .orderBy(asc(qbChapters.orderIndex));

    c.header("Cache-Control", CACHE_CONTROL_PUBLIC);
    return c.json({
      success: true,
      data: {
        target: target
          ? {
              id: target.id,
              group: target.group,
              name: target.name,
              slug: target.slug,
              orderIndex: target.orderIndex,
            }
          : null,
        subject: {
          id: subject.id,
          targetId: subject.targetId,
          name: subject.name,
          slug: subject.slug,
          orderIndex: subject.orderIndex,
        },
        chapters: chapters.map((ch) => ({
          id: ch.id,
          subjectId: ch.subjectId,
          name: ch.name,
          slug: ch.slug,
          orderIndex: ch.orderIndex,
          questionCount: ch.questionCount,
        })),
      },
    });
  })
  .get(
    "/subjects/:subjectSlug/chapters/:chapterSlug",
    zValidator(
      "query",
      z.object({
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
        targetSlug: z.string().optional(),
        sourceType: z
          .enum([
            "board",
            "university",
            "medical",
            "engineering",
            "bcs",
            "bank_job",
            "model_test",
            "other",
          ])
          .optional(),
        qType: z.enum(["mcq", "written"]).optional(),
      }),
    ),
    async (c) => {
      const paramSubjectSlug = c.req.param("subjectSlug");
      const chapterSlug = c.req.param("chapterSlug");
      const {
        page,
        limit,
        topicId,
        sourceId,
        sourceSlug,
        source,
        sourceType,
        examSheetId,
        examSheetSlug,
        examSheet,
        subjectSlug: querySubjectSlug,
        targetSlug,
        qType,
      } = c.req.valid("query");

      let subject: typeof qbSubjects.$inferSelect | undefined = (
        await selectSubjectBySlug.execute({ slug: paramSubjectSlug })
      )[0];
      let containerItem: typeof qbContainerItems.$inferSelect | undefined;

      if (!subject) {
        containerItem = await db.query.qbContainerItems.findFirst({
          where: eq(qbContainerItems.slug, paramSubjectSlug),
        });
        if (containerItem?.subjectId) {
          subject = await db.query.qbSubjects.findFirst({
            where: eq(qbSubjects.id, containerItem.subjectId),
          });
        }
      }

      if (!subject && !containerItem) {
        return c.json({ success: false, error: "Subject not found" }, 404);
      }

      const effectiveSubject = subject || {
        id: containerItem!.id,
        targetId: null,
        name: containerItem!.name,
        slug: containerItem!.slug,
        code: null,
        orderIndex: containerItem!.orderIndex,
        chapterCount: 0,
        questionCount: containerItem!.questionCount,
      };

      const [target] = effectiveSubject.targetId
        ? await selectTargetById.execute({ id: effectiveSubject.targetId })
        : [];

      const isAll = chapterSlug === "all";
      let chapter: typeof qbChapters.$inferSelect | undefined;

      if (isAll) {
        chapter = {
          id: "all",
          subjectId: effectiveSubject.id,
          containerItemId: containerItem?.id ?? null,
          name: "সকল অধ্যায় / প্রশ্নপত্র",
          slug: "all",
          orderIndex: 0,
          topicCount: 0,
          questionCount: effectiveSubject.questionCount,
        };
      } else {
        if (subject) {
          const [found] = await selectChapterBySubjectSlug.execute({
            subjectId: subject.id,
            slug: chapterSlug,
          });
          chapter = found;
        }
        if (!chapter && containerItem) {
          chapter = await db.query.qbChapters.findFirst({
            where: and(
              eq(qbChapters.containerItemId, containerItem.id),
              eq(qbChapters.slug, chapterSlug),
            ),
          });
        }
      }

      if (!chapter) {
        return c.json({ success: false, error: "Chapter not found" }, 404);
      }

      // Collect all chapter IDs if isAll
      const subChapterIds = isAll
        ? subject
          ? (
              await db
                .select({ id: qbChapters.id })
                .from(qbChapters)
                .where(eq(qbChapters.subjectId, subject.id))
            ).map((c) => c.id)
          : containerItem
            ? (
                await db
                  .select({ id: qbChapters.id })
                  .from(qbChapters)
                  .where(eq(qbChapters.containerItemId, containerItem.id))
              ).map((c) => c.id)
            : []
        : [chapter.id];

      const targetSourceTypeMap: Record<
        string,
        "medical" | "engineering" | "university" | "board"
      > = {
        medical: "medical",
        engineering: "engineering",
        general: "university",
        varsity: "university",
        "hsc-science": "board",
        "hsc-general": "board",
      };
      const effectiveTargetSlug = targetSlug || target?.slug;
      const targetSourceType = effectiveTargetSlug
        ? targetSourceTypeMap[effectiveTargetSlug]
        : undefined;

      const [allTopics, allChapters, allSubjects, sourcesList, examSheetsList, chapterTopicCounts] =
        await Promise.all([
          db.select().from(qbTopics).orderBy(asc(qbTopics.orderIndex)),
          db.select().from(qbChapters).orderBy(asc(qbChapters.orderIndex)),
          db.select().from(qbSubjects).orderBy(asc(qbSubjects.orderIndex)),
          subChapterIds.length > 0
            ? db
                .select({
                  id: qbSources.id,
                  sourceGroup: qbSources.sourceGroup,
                  type: qbSources.type,
                  name: qbSources.name,
                  slug: qbSources.slug,
                  institution: qbSources.institution,
                  unit: qbSources.unit,
                  year: qbSources.year,
                  questionCount: qbSources.questionCount,
                })
                .from(qbSources)
                .innerJoin(qbChapterSources, eq(qbChapterSources.sourceId, qbSources.id))
                .where(
                  and(
                    inArray(qbChapterSources.chapterId, subChapterIds),
                    targetSourceType ? eq(qbSources.type, targetSourceType) : undefined,
                  ),
                )
                .orderBy(desc(qbSources.year), asc(qbSources.name))
            : [],
          containerItem
            ? db
                .select()
                .from(qbExamSheets)
                .where(eq(qbExamSheets.containerItemId, containerItem.id))
                .orderBy(asc(qbExamSheets.orderIndex), asc(qbExamSheets.title))
            : subChapterIds.length > 0
              ? db
                  .select()
                  .from(qbExamSheets)
                  .where(inArray(qbExamSheets.chapterId, subChapterIds))
                  .orderBy(asc(qbExamSheets.orderIndex), asc(qbExamSheets.title))
              : [],
          subChapterIds.length > 0
            ? targetSourceType
              ? db
                  .select({
                    topicId: qbQuestions.topicId,
                    total: count(qbQuestions.id),
                  })
                  .from(qbQuestions)
                  .innerJoin(qbTopics, and(
                    eq(qbTopics.id, qbQuestions.topicId),
                    inArray(qbTopics.chapterId, subChapterIds),
                  ))
                  .innerJoin(qbQuestionSources, eq(qbQuestionSources.questionId, qbQuestions.id))
                  .innerJoin(
                    qbSources,
                    and(
                      eq(qbSources.id, qbQuestionSources.sourceId),
                      eq(qbSources.type, targetSourceType),
                    ),
                  )
                  .where(eq(qbQuestions.status, "published"))
                  .groupBy(qbQuestions.topicId)
              : db
                  .select({
                    topicId: qbQuestions.topicId,
                    total: count(qbQuestions.id),
                  })
                  .from(qbQuestions)
                  .innerJoin(qbTopics, and(
                    eq(qbTopics.id, qbQuestions.topicId),
                    inArray(qbTopics.chapterId, subChapterIds),
                  ))
                  .where(eq(qbQuestions.status, "published"))
                  .groupBy(qbQuestions.topicId)
            : [],
        ]);

      const topicMap = new Map(allTopics.map((t) => [t.id, t]));
      const chapterMap = new Map(allChapters.map((c) => [c.id, c]));
      const subjectMap = new Map(allSubjects.map((s) => [s.id, s]));

      const chapterTopicCountMap = new Map(
        chapterTopicCounts.map((tc) => [tc.topicId ?? "", Number(tc.total)]),
      );

      const chapterTopicIdSet = new Set<string>();
      const topicQueue: string[] = [];

      for (const t of allTopics) {
        if (t.parentTopicId && subChapterIds.includes(t.parentTopicId)) {
          chapterTopicIdSet.add(t.id);
          topicQueue.push(t.id);
        }
      }

      while (topicQueue.length > 0) {
        const currentParentId = topicQueue.shift()!;
        for (const t of allTopics) {
          if (t.parentTopicId === currentParentId && !chapterTopicIdSet.has(t.id)) {
            chapterTopicIdSet.add(t.id);
            topicQueue.push(t.id);
          }
        }
      }

      let topicsList =
        chapterTopicIdSet.size > 0 ? allTopics.filter((t) => chapterTopicIdSet.has(t.id)) : [];

      const effectiveExamSheet = examSheet || examSheetSlug || examSheetId;
      let matchedExamSheet: (typeof examSheetsList)[number] | undefined;
      let examSheetSubjectsList: Array<{
        id: string;
        name: string;
        slug: string;
        orderIndex: number;
        questionCount: number;
      }> = [];

      if (effectiveExamSheet && effectiveExamSheet !== "all") {
        matchedExamSheet = examSheetsList.find(
          (es) => es.id === effectiveExamSheet || es.slug === effectiveExamSheet,
        );
        if (matchedExamSheet) {
          const esQuestions = await db
            .select({
              id: qbQuestions.id,
              topicId: qbQuestions.topicId,
            })
            .from(qbQuestions)
            .innerJoin(
              qbExamSheetQuestions,
              and(
                eq(qbExamSheetQuestions.questionId, qbQuestions.id),
                eq(qbExamSheetQuestions.examSheetId, matchedExamSheet.id),
              ),
            )
            .where(eq(qbQuestions.status, "published"));

          const esSubjectCounts = new Map<
            string,
            {
              id: string;
              name: string;
              slug: string;
              orderIndex: number;
              questionCount: number;
            }
          >();
          const esTopicCounts = new Map<string, number>();
          const esTopicIdSet = new Set<string>();

          for (const q of esQuestions) {
            if (!q.topicId) continue;
            esTopicCounts.set(q.topicId, (esTopicCounts.get(q.topicId) || 0) + 1);
            esTopicIdSet.add(q.topicId);

            let curr = topicMap.get(q.topicId);
            while (curr) {
              if (curr.parentTopicId) {
                esTopicIdSet.add(curr.parentTopicId);
                if (chapterMap.has(curr.parentTopicId)) {
                  const ch = chapterMap.get(curr.parentTopicId)!;
                  const sub = subjectMap.get(ch.subjectId);
                  if (sub) {
                    const existing = esSubjectCounts.get(sub.id) || {
                      id: sub.id,
                      name: sub.name,
                      slug: sub.slug,
                      orderIndex: sub.orderIndex,
                      questionCount: 0,
                    };
                    existing.questionCount++;
                    esSubjectCounts.set(sub.id, existing);
                  }
                  break;
                }
                curr = topicMap.get(curr.parentTopicId);
              } else {
                break;
              }
            }
          }

          examSheetSubjectsList = Array.from(esSubjectCounts.values()).sort(
            (a, b) => a.orderIndex - b.orderIndex,
          );

          if (querySubjectSlug && querySubjectSlug !== "all") {
            const filterSubject = allSubjects.find(
              (s) => s.slug === querySubjectSlug || s.id === querySubjectSlug,
            );
            if (filterSubject) {
              const subChapterIdList = allChapters
                .filter((c) => c.subjectId === filterSubject.id)
                .map((c) => c.id);
              const subjectTopicIds = new Set<string>();
              for (const t of allTopics) {
                if (t.parentTopicId && subChapterIdList.includes(t.parentTopicId)) {
                  subjectTopicIds.add(t.id);
                }
              }
              const sQueue = Array.from(subjectTopicIds);
              while (sQueue.length > 0) {
                const parent = sQueue.shift()!;
                for (const t of allTopics) {
                  if (t.parentTopicId === parent && !subjectTopicIds.has(t.id)) {
                    subjectTopicIds.add(t.id);
                    sQueue.push(t.id);
                  }
                }
              }
              topicsList = allTopics
                .filter((t) => esTopicIdSet.has(t.id) && subjectTopicIds.has(t.id))
                .map((t) => ({
                  ...t,
                  questionCount: esTopicCounts.get(t.id) ?? 0,
                }));
            } else {
              topicsList = allTopics
                .filter((t) => esTopicIdSet.has(t.id))
                .map((t) => ({
                  ...t,
                  questionCount: esTopicCounts.get(t.id) ?? 0,
                }));
            }
          } else {
            topicsList = allTopics
              .filter((t) => esTopicIdSet.has(t.id))
              .map((t) => ({
                ...t,
                questionCount: esTopicCounts.get(t.id) ?? 0,
              }));
          }
        }
      }

      const conditions: SQL[] = [eq(qbQuestions.status, "published")];

      if (matchedExamSheet) {
        const questionIdsWithExamSheet = db
          .select({ questionId: qbExamSheetQuestions.questionId })
          .from(qbExamSheetQuestions)
          .where(eq(qbExamSheetQuestions.examSheetId, matchedExamSheet.id));
        conditions.push(inArray(qbQuestions.id, questionIdsWithExamSheet));
      } else if (subChapterIds.length > 0) {
        conditions.push(
          inArray(
            qbQuestions.topicId,
            db
              .select({ id: qbTopics.id })
              .from(qbTopics)
              .where(inArray(qbTopics.chapterId, subChapterIds)),
          ),
        );

        if (targetSourceType && !sourceId && !sourceType) {
          conditions.push(
            inArray(
              qbQuestions.id,
              db
                .select({ questionId: qbQuestionSources.questionId })
                .from(qbQuestionSources)
                .innerJoin(
                  qbSources,
                  and(
                    eq(qbSources.id, qbQuestionSources.sourceId),
                    eq(qbSources.type, targetSourceType),
                  ),
                ),
            ),
          );
        }
      } else if (containerItem) {
        const esIds = examSheetsList.map((e) => e.id);
        if (esIds.length > 0) {
          conditions.push(
            inArray(
              qbQuestions.id,
              db
                .select({ questionId: qbExamSheetQuestions.questionId })
                .from(qbExamSheetQuestions)
                .where(inArray(qbExamSheetQuestions.examSheetId, esIds)),
            ),
          );
        }
      }

      if (querySubjectSlug && querySubjectSlug !== "all") {
        const targetSub = allSubjects.find(
          (s) => s.slug === querySubjectSlug || s.id === querySubjectSlug,
        );
        if (targetSub) {
          const subChapterIdList = allChapters
            .filter((c) => c.subjectId === targetSub.id)
            .map((c) => c.id);
          if (subChapterIdList.length > 0) {
            conditions.push(
              inArray(
                qbQuestions.topicId,
                db
                  .select({ id: qbTopics.id })
                  .from(qbTopics)
                  .where(inArray(qbTopics.chapterId, subChapterIdList)),
              ),
            );
          }
        }
      }

      const effectiveTopicId = topicId && topicId !== "all" ? topicId : undefined;
      if (effectiveTopicId) {
        const descendantTopicIds = new Set<string>([effectiveTopicId]);
        const stack = [effectiveTopicId];
        while (stack.length > 0) {
          const currentId = stack.pop() as string;
          for (const t of allTopics) {
            if (t.parentTopicId === currentId && !descendantTopicIds.has(t.id)) {
              descendantTopicIds.add(t.id);
              stack.push(t.id);
            }
          }
        }
        const topicIdArray = Array.from(descendantTopicIds);
        if (topicIdArray.length === 1) {
          conditions.push(eq(qbQuestions.topicId, topicIdArray[0]));
        } else {
          conditions.push(inArray(qbQuestions.topicId, topicIdArray));
        }
      }

      const effectiveSource = source || sourceSlug || sourceId;
      let matchedSource: (typeof sourcesList)[number] | undefined;
      let sourceTopicCountMap: Map<string, number> | undefined;

      if (effectiveSource && effectiveSource !== "all") {
        matchedSource = sourcesList.find(
          (s) => s.id === effectiveSource || s.slug === effectiveSource,
        );
        if (matchedSource) {
          const questionIdsWithSource = db
            .select({ questionId: qbQuestionSources.questionId })
            .from(qbQuestionSources)
            .where(eq(qbQuestionSources.sourceId, matchedSource.id));
          conditions.push(inArray(qbQuestions.id, questionIdsWithSource));

          const sourceTopicCounts = await db
            .select({
              topicId: qbQuestions.topicId,
              total: count(qbQuestions.id),
            })
            .from(qbQuestions)
            .innerJoin(qbQuestionSources, eq(qbQuestionSources.questionId, qbQuestions.id))
            .innerJoin(qbTopics, eq(qbTopics.id, qbQuestions.topicId))
            .where(
              and(
                subChapterIds.length > 0
                  ? inArray(qbTopics.chapterId, subChapterIds)
                  : undefined,
                eq(qbQuestions.status, "published"),
                eq(qbQuestionSources.sourceId, matchedSource.id),
              ),
            )
            .groupBy(qbQuestions.topicId);

          sourceTopicCountMap = new Map(
            sourceTopicCounts.map((st) => [st.topicId ?? "", Number(st.total)]),
          );
        }
      }

      if (sourceType) {
        const questionIdsWithSourceType = db
          .select({ questionId: qbQuestionSources.questionId })
          .from(qbQuestionSources)
          .innerJoin(qbSources, eq(qbQuestionSources.sourceId, qbSources.id))
          .where(eq(qbSources.type, sourceType));
        conditions.push(inArray(qbQuestions.id, questionIdsWithSourceType));
      } else if (target?.group === "academic" && !effectiveSource) {
        // In Academic target, only show questions belonging to academic sources
        const academicQuestionIds = db
          .select({ questionId: qbQuestionSources.questionId })
          .from(qbQuestionSources)
          .innerJoin(qbSources, eq(qbQuestionSources.sourceId, qbSources.id))
          .where(eq(qbSources.sourceGroup, "academic"));
        conditions.push(inArray(qbQuestions.id, academicQuestionIds));
      }

      if (qType) {
        conditions.push(eq(qbQuestions.qType, qType));
      }

      const whereClause = and(...conditions);
      const isFiltered = Boolean(
        effectiveTopicId ||
          qType ||
          sourceType ||
          targetSlug ||
          targetSourceType ||
          effectiveSource ||
          effectiveExamSheet ||
          querySubjectSlug ||
          target?.group === "academic",
      );
      const defaultTotal = matchedExamSheet
        ? matchedExamSheet.questionCount
        : matchedSource
          ? matchedSource.questionCount
          : chapter.questionCount;
      const offset = (page - 1) * limit;

      const [countResult, paginatedIdRows] = await Promise.all([
        isFiltered
          ? db
              .select({ total: count(qbQuestions.id) })
              .from(qbQuestions)
              .where(whereClause)
          : Promise.resolve([{ total: defaultTotal }]),
        db
          .select({ id: qbQuestions.id })
          .from(qbQuestions)
          .where(whereClause)
          .orderBy(asc(qbQuestions.orderIndex), asc(qbQuestions.id))
          .limit(limit)
          .offset(offset),
      ]);

      const questionIds = paginatedIdRows.map((r) => r.id);
      const questionsList =
        questionIds.length > 0
          ? await db.query.qbQuestions.findMany({
              where: inArray(qbQuestions.id, questionIds),
              orderBy: [asc(qbQuestions.orderIndex), asc(qbQuestions.id)],
              with: {
                options: { orderBy: [asc(qbQuestionOptions.orderIndex)] },
                parts: { orderBy: [asc(qbQuestionParts.orderIndex)] },
                questionSources: { with: { source: true } },
                topic: true,
              },
            })
          : [];

      const total = Number(countResult[0]?.total ?? 0);
      const totalPages = Math.max(1, Math.ceil(total / limit));

      c.header("Cache-Control", CACHE_CONTROL_PUBLIC);
      return c.json({
        success: true,
        data: {
          target: target
            ? {
                id: target.id,
                group: target.group,
                name: target.name,
                slug: target.slug,
                orderIndex: target.orderIndex,
              }
            : null,
          subject: {
            id: effectiveSubject.id,
            targetId: effectiveSubject.targetId,
            name: effectiveSubject.name,
            slug: effectiveSubject.slug,
            orderIndex: effectiveSubject.orderIndex,
          },
          chapter: {
            id: chapter.id,
            subjectId: chapter.subjectId,
            name: chapter.name,
            slug: chapter.slug,
            orderIndex: chapter.orderIndex,
            questionCount: chapter.questionCount,
          },
          subjects: examSheetSubjectsList,
          topics: topicsList.map((t) => ({
            id: t.id,
            parentId: t.parentTopicId,
            name: t.name,
            slug: t.slug,
            orderIndex: t.orderIndex,
            questionCount:
              (t as any).questionCount ??
              (sourceTopicCountMap
                ? (sourceTopicCountMap.get(t.id) ?? 0)
                : (chapterTopicCountMap.get(t.id) ?? 0)),
          })),
          sources: sourcesList.map((s) => ({
            ...s,
            questionCount: s.questionCount,
          })),
          examSheets: examSheetsList.map((es) => ({
            id: es.id,
            chapterId: es.chapterId,
            title: es.title,
            slug: es.slug,
            examType: es.examType,
            durationMinutes: es.durationMinutes,
            totalMarks: es.totalMarks,
            negativeMarks: es.negativeMarks,
            orderIndex: es.orderIndex,
            questionCount: es.questionCount,
          })),
          questions: questionsList.map((q) => mapQuestion(q, { includeAnswers: true })),
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      });
    },
  )
  .get("/questions/:id", async (c) => {
    const id = c.req.param("id");

    const question = await db.query.qbQuestions.findFirst({
      where: eq(qbQuestions.id, id),
      with: {
        options: { orderBy: [asc(qbQuestionOptions.orderIndex)] },
        parts: { orderBy: [asc(qbQuestionParts.orderIndex)] },
        questionSources: { with: { source: true } },
        topic: true,
      },
    });

    if (!question) {
      return c.json({ success: false, error: "Question not found" }, 404);
    }

    c.header("Cache-Control", CACHE_CONTROL_PUBLIC);
    return c.json({
      success: true,
      data: mapQuestion(question, { includeAnswers: true }),
    });
  })
  .get("/tree", async (c) => {
    const [
      targetsList,
      containersList,
      containerItemsList,
      subjectsList,
      chaptersList,
      topicsList,
    ] = await Promise.all([
      db.select().from(qbTargets).orderBy(asc(qbTargets.orderIndex)),
      db.select().from(qbContainers).orderBy(asc(qbContainers.orderIndex)),
      db.select().from(qbContainerItems).orderBy(asc(qbContainerItems.orderIndex)),
      db.select().from(qbSubjects).orderBy(asc(qbSubjects.orderIndex)),
      db.select().from(qbChapters).orderBy(asc(qbChapters.orderIndex)),
      db.select().from(qbTopics).orderBy(asc(qbTopics.orderIndex)),
    ]);

    const topicsByParent = new Map<string, typeof topicsList>();
    for (const top of topicsList) {
      if (top.parentTopicId) {
        const list = topicsByParent.get(top.parentTopicId) ?? [];
        list.push(top);
        topicsByParent.set(top.parentTopicId, list);
      }
    }

    const itemsByContainer = new Map<string, typeof containerItemsList>();
    for (const it of containerItemsList) {
      const list = itemsByContainer.get(it.containerId) ?? [];
      list.push(it);
      itemsByContainer.set(it.containerId, list);
    }

    const containersByTarget = new Map<string, typeof containersList>();
    for (const ct of containersList) {
      const list = containersByTarget.get(ct.targetId) ?? [];
      list.push(ct);
      containersByTarget.set(ct.targetId, list);
    }

    const subjectsByTarget = new Map<string, typeof subjectsList>();
    for (const s of subjectsList) {
      if (s.targetId) {
        const list = subjectsByTarget.get(s.targetId) ?? [];
        list.push(s);
        subjectsByTarget.set(s.targetId, list);
      }
    }

    const chaptersBySubject = new Map<string, typeof chaptersList>();
    for (const ch of chaptersList) {
      const list = chaptersBySubject.get(ch.subjectId) ?? [];
      list.push(ch);
      chaptersBySubject.set(ch.subjectId, list);
    }

    const tree = targetsList.map((target) => {
      const containers = (containersByTarget.get(target.id) ?? []).map((ct) => {
        const items = (itemsByContainer.get(ct.id) ?? []).map((it) => ({
          id: it.id,
          name: it.name,
          slug: it.slug,
          questionCount: it.questionCount,
        }));
        return {
          id: ct.id,
          name: ct.name,
          slug: ct.slug,
          itemCount: ct.itemCount,
          questionCount: ct.questionCount,
          items,
        };
      });

      const targetSubjects = subjectsByTarget.get(target.id);
      const effectiveSubjects =
        targetSubjects && targetSubjects.length > 0 ? targetSubjects : subjectsList;
      const subjects = effectiveSubjects.map((subject) => {
        const chapters = (chaptersBySubject.get(subject.id) ?? []).map((chapter) => {
          const topics = (topicsByParent.get(chapter.id) ?? []).map((tp) => ({
            id: tp.id,
            name: tp.name,
            slug: tp.slug,
            questionCount: tp.questionCount,
          }));
          return {
            id: chapter.id,
            name: chapter.name,
            slug: chapter.slug,
            questionCount: chapter.questionCount,
            topics,
          };
        });
        return {
          id: subject.id,
          name: subject.name,
          slug: subject.slug,
          questionCount: subject.questionCount,
          chapters,
        };
      });

      return {
        id: target.id,
        group: target.group,
        name: target.name,
        slug: target.slug,
        containers,
        subjects,
      };
    });
    c.header("Cache-Control", CACHE_CONTROL_PUBLIC);
    return c.json({ success: true, data: tree });
  })
  .route("/", examRoute)
  .post(
    "/bulk-import",
    zValidator(
      "json",
      z.object({
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
              orderIndex: z.number().optional(),
            }),
          )
          .optional(),
        questions: z.array(
          z.object({
            id: z.string().optional(),
            qType: z.enum(["mcq", "written"]).default("mcq"),
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
      }),
    ),
    async (c) => {
      const { subjectId, chapterId, sourceId, topics, questions } = c.req.valid("json");

      const chapter = await db.query.qbChapters.findFirst({
        where: and(eq(qbChapters.id, chapterId), eq(qbChapters.subjectId, subjectId)),
      });

      if (!chapter) {
        return c.json(
          {
            success: false,
            error: `Chapter '${chapterId}' not found for subject '${subjectId}'`,
          },
          404,
        );
      }

      const topicSlugToId = new Map<string, string>();

      if (topics && topics.length > 0) {
        for (const t of topics) {
          const slug =
            t.slug ||
            t.name
              .toLowerCase()
              .replace(/[^a-z0-9_-]/g, "-")
              .replace(/^-+|-+$/g, "");

          const [existing] = await db
            .select({ id: qbTopics.id })
            .from(qbTopics)
            .where(eq(qbTopics.slug, slug));

          if (existing) {
            topicSlugToId.set(slug, existing.id);
            if (t.id) topicSlugToId.set(t.id, existing.id);
          } else {
            const newId = uuidv7();
            await db.insert(qbTopics).values({
              id: newId,
              chapterId,
              parentTopicId: (t as any).parentId ?? (t as any).parentTopicId ?? null,
              name: t.name,
              slug,
              orderIndex: t.orderIndex ?? 1,
            });
            topicSlugToId.set(slug, newId);
            if (t.id) topicSlugToId.set(t.id, newId);
          }
        }
      }

      const createdQuestionIds: string[] = [];

      await Promise.all(
        questions.map(async (q, idx) => {
          const questionId = q.id || uuidv7();
          const orderIndex = q.orderIndex ?? idx + 1;

          const cleanedQuestionText = cleanAndFormatMathText(q.questionText);
          const cleanedContextText = q.contextText ? cleanAndFormatMathText(q.contextText) : null;
          const cleanedExplanation = q.explanation ? cleanAndFormatMathText(q.explanation) : null;

          let resolvedTopicId: string | null = null;
          if (q.topicId) {
            resolvedTopicId = topicSlugToId.get(q.topicId) ?? null;
            if (
              !resolvedTopicId &&
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(q.topicId)
            ) {
              resolvedTopicId = q.topicId;
            }
          }

          await db
            .insert(qbQuestions)
            .values({
              id: questionId,
              topicId: resolvedTopicId,
              qType: q.qType,
              questionText: cleanedQuestionText,
              contextText: cleanedContextText,
              explanation: cleanedExplanation,
              status: "published",
              orderIndex,
            })
            .onConflictDoUpdate({
              target: [qbQuestions.id],
              set: {
                topicId: resolvedTopicId,
                questionText: cleanedQuestionText,
                contextText: cleanedContextText,
                explanation: cleanedExplanation,
                orderIndex,
              },
            });



          createdQuestionIds.push(questionId);

          if (q.qType === "mcq" && q.options && q.options.length > 0) {
            await Promise.all(
              q.options.map(async (opt, optIdx) => {
                const optId = opt.id || uuidv7();
                const optionOrderIndex = opt.orderIndex ?? optIdx;
                const cleanedOptionText = cleanAndFormatMathText(opt.optionText);
                await db
                  .insert(qbQuestionOptions)
                  .values({
                    id: optId,
                    questionId,
                    optionText: cleanedOptionText,
                    isCorrect: opt.isCorrect,
                    orderIndex: optionOrderIndex,
                  })
                  .onConflictDoUpdate({
                    target: [qbQuestionOptions.id],
                    set: {
                      optionText: cleanedOptionText,
                      isCorrect: opt.isCorrect,
                    },
                  });
              }),
            );
          }

          if (q.qType === "written" && q.parts && q.parts.length > 0) {
            await Promise.all(
              q.parts.map(async (part, partIdx) => {
                const partId = part.id || uuidv7();
                const partOrderIndex = part.orderIndex ?? partIdx;
                const cleanedPartText = cleanAndFormatMathText(part.partText);
                const cleanedPartAnswer = part.answerText
                  ? cleanAndFormatMathText(part.answerText)
                  : null;
                await db
                  .insert(qbQuestionParts)
                  .values({
                    id: partId,
                    questionId,
                    partText: cleanedPartText,
                    answerText: cleanedPartAnswer,
                    marks:
                      part.marks !== undefined && part.marks !== null ? String(part.marks) : "5",
                    orderIndex: partOrderIndex,
                  })
                  .onConflictDoUpdate({
                    target: [qbQuestionParts.questionId, qbQuestionParts.orderIndex],
                    set: {
                      partText: cleanedPartText,
                      answerText: cleanedPartAnswer,
                      marks:
                        part.marks !== undefined && part.marks !== null ? String(part.marks) : "5",
                    },
                  });
              }),
            );
          }

          const targetSourceId = q.sourceId || sourceId;
          if (targetSourceId) {
            await db
              .insert(qbQuestionSources)
              .values({ questionId, sourceId: targetSourceId })
              .onConflictDoNothing();
          }
        }),
      );

      return c.json({
        success: true,
        data: {
          importedCount: questions.length,
          questionIds: createdQuestionIds,
        },
      });
    },
  );
