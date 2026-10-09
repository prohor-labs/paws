import { Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, ilike, inArray, or, sql, type SQL } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { DrizzleService } from '../../common/database/drizzle.service.js';
import {
  qbChapterSources,
  qbChapters,
  qbContainerItems,
  qbContainers,
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
} from '../../common/database/schema/index.js';
import { ApiError } from '../../common/errors/api-error.js';
import { cleanAndFormatMathText } from '../../common/utils/math.js';
import type { BulkImportDto, ChapterQueryDto } from './qb.dto.js';
import { mapQuestion, type MappableQuestion } from './qb.mapper.js';
import { recalculateAllCounts } from './qb-count.js';

const PUBLIC_CACHE_CONTROL = 'public, s-maxage=300, stale-while-revalidate=3600';

const TARGET_SOURCE_TYPE_MAP: Partial<
  Record<string, 'medical' | 'engineering' | 'university' | 'board'>
> = {
  medical: 'medical',
  engineering: 'engineering',
  general: 'university',
  varsity: 'university',
  'hsc-science': 'board',
  'hsc-general': 'board',
};



type TargetRow = typeof qbTargets.$inferSelect;
type ContainerRow = typeof qbContainers.$inferSelect;
type ContainerItemRow = typeof qbContainerItems.$inferSelect;
type SubjectRow = typeof qbSubjects.$inferSelect;
type ChapterRow = typeof qbChapters.$inferSelect;
type TopicRow = typeof qbTopics.$inferSelect;

function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function asMappable(question: unknown): MappableQuestion {
  return question as MappableQuestion;
}

function normalizeBengaliSlug(str: string): string {
  return str
    .normalize('NFC')
    .replace(/\u09AF\u09BC/g, '\u09DF')
    .replace(/\u09A1\u09BC/g, '\u09DC')
    .replace(/\u09A2\u09BC/g, '\u09DD')
    .replace(/[^\w\s\u0980-\u09FF-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

@Injectable()
export class QbService {
  constructor(private readonly drizzle: DrizzleService) {}

  private get db() {
    return this.drizzle.db;
  }

  async recalculate() {
    await recalculateAllCounts(this.db);
    return {
      success: true,
      message: 'Recalculated all question and entity counts successfully',
    };
  }

  async getHub() {
    const [targetsList, sourcesList] = await Promise.all([
      this.db.select().from(qbTargets).orderBy(asc(qbTargets.orderIndex)),
      this.db.select().from(qbSources).orderBy(desc(qbSources.year), asc(qbSources.name)),
    ]);

    const targets = targetsList.map((target) => ({
      id: target.id,
      group: target.group,
      name: target.name,
      slug: target.slug,
      orderIndex: target.orderIndex,
      subjectCount: target.subjectCount,
      questionCount: target.questionCount,
    }));

    return { success: true, data: { targets, sources: sourcesList } };
  }

  async getTarget(slug: string) {
    const [target] = await this.db.select().from(qbTargets).where(eq(qbTargets.slug, slug));

    if (!target) {
      throw ApiError.notFound('Target not found');
    }

    const [containers, subjects] = await Promise.all([
      this.db
        .select()
        .from(qbContainers)
        .where(eq(qbContainers.targetId, target.id))
        .orderBy(asc(qbContainers.orderIndex)),
      this.db
        .select()
        .from(qbSubjects)
        .where(eq(qbSubjects.targetId, target.id))
        .orderBy(asc(qbSubjects.orderIndex)),
    ]);

    return {
      success: true,
      data: {
        target: {
          id: target.id,
          group: target.group,
          name: target.name,
          slug: target.slug,
          orderIndex: target.orderIndex,
        },
        containers: containers.map((container) => ({
          id: container.id,
          targetId: container.targetId,
          name: container.name,
          slug: container.slug,
          description: container.description,
          iconUrl: container.iconUrl,
          orderIndex: container.orderIndex,
          itemCount: container.itemCount,
          questionCount: container.questionCount,
        })),
        subjects: subjects.map((subject) => ({
          id: subject.id,
          targetId: subject.targetId,
          name: subject.name,
          slug: subject.slug,
          code: subject.code,
          orderIndex: subject.orderIndex,
          chapterCount: subject.chapterCount,
          questionCount: subject.questionCount,
        })),
      },
    };
  }

  private async resolveContainer(
    target: TargetRow,
    containerSlug: string,
    itemSlug?: string,
  ): Promise<ContainerRow | undefined> {
    const allContainers = await this.db.query.qbContainers.findMany({
      where: eq(qbContainers.targetId, target.id),
    });

    const decodedSlug = decodeURIComponent(containerSlug);
    const normSlug = normalizeBengaliSlug(decodedSlug);

    let container = allContainers.find(
      (c) =>
        c.slug === containerSlug ||
        c.slug === decodedSlug ||
        normalizeBengaliSlug(c.slug) === normSlug ||
        normalizeBengaliSlug(c.name) === normSlug,
    );

    if (container) {
      return container;
    }

    const matchingItem = await this.db
      .select({ containerId: qbContainerItems.containerId })
      .from(qbContainerItems)
      .innerJoin(qbContainers, eq(qbContainerItems.containerId, qbContainers.id))
      .where(
        and(
          eq(qbContainers.targetId, target.id),
          itemSlug
            ? or(eq(qbContainerItems.slug, itemSlug), eq(qbContainerItems.slug, decodedSlug))
            : eq(qbContainerItems.slug, decodedSlug),
        ),
      )
      .limit(1);

    if (!matchingItem[0]) {
      return undefined;
    }

    return this.db.query.qbContainers.findFirst({
      where: eq(qbContainers.id, matchingItem[0].containerId),
    });
  }

  async getContainer(targetSlug: string, containerSlug: string) {
    const [target] = await this.db.select().from(qbTargets).where(eq(qbTargets.slug, targetSlug));
    if (!target) {
      throw ApiError.notFound('Target not found');
    }

    const container = await this.resolveContainer(target, containerSlug);
    if (!container) {
      const subject = await this.db.query.qbSubjects.findFirst({
        where: and(
          eq(qbSubjects.targetId, target.id),
          or(
            eq(qbSubjects.slug, containerSlug),
            eq(qbSubjects.slug, decodeURIComponent(containerSlug)),
          ),
        ),
      });

      if (subject) {
        const chapters = await this.db
          .select()
          .from(qbChapters)
          .where(eq(qbChapters.subjectId, subject.id))
          .orderBy(asc(qbChapters.orderIndex));

        return {
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
              id: subject.id,
              targetId: target.id,
              name: subject.name,
              slug: subject.slug,
              description: null,
              iconUrl: null,
              orderIndex: subject.orderIndex,
              itemCount: chapters.length,
              questionCount: subject.questionCount,
            },
            items: chapters.map((ch) => ({
              id: ch.id,
              containerId: subject.id,
              subjectId: subject.id,
              name: ch.name,
              slug: ch.slug,
              description: null,
              iconUrl: null,
              orderIndex: ch.orderIndex,
              examSheetCount: 0,
              questionCount: ch.questionCount,
            })),
          },
        };
      }

      throw ApiError.notFound('Container not found');
    }

    const items = await this.db
      .select()
      .from(qbContainerItems)
      .where(eq(qbContainerItems.containerId, container.id))
      .orderBy(asc(qbContainerItems.orderIndex));

    return {
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
        items: items.map((item) => ({
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
        })),
      },
    };
  }

  async getContainerItem(targetSlug: string, containerSlug: string, itemSlug: string) {
    const [target] = await this.db.select().from(qbTargets).where(eq(qbTargets.slug, targetSlug));
    if (!target) {
      throw ApiError.notFound('Target not found');
    }

    const container = await this.resolveContainer(target, containerSlug, itemSlug);
    if (!container) {
      const subject = await this.db.query.qbSubjects.findFirst({
        where: and(
          eq(qbSubjects.targetId, target.id),
          or(
            eq(qbSubjects.slug, containerSlug),
            eq(qbSubjects.slug, decodeURIComponent(containerSlug)),
          ),
        ),
      });

      if (subject) {
        const decodedItemSlug = decodeURIComponent(itemSlug);
        const normItemSlug = normalizeBengaliSlug(decodedItemSlug);

        const allChapters = await this.db
          .select()
          .from(qbChapters)
          .where(eq(qbChapters.subjectId, subject.id))
          .orderBy(asc(qbChapters.orderIndex));

        let chapter = allChapters.find(
          (c) =>
            c.slug === itemSlug ||
            c.slug === decodedItemSlug ||
            normalizeBengaliSlug(c.slug) === normItemSlug ||
            normalizeBengaliSlug(c.name) === normItemSlug,
        );

        if (!chapter) {
          chapter = allChapters[0];
        }

        if (chapter) {
          return {
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
                id: subject.id,
                targetId: target.id,
                name: subject.name,
                slug: subject.slug,
                description: null,
                iconUrl: null,
                orderIndex: subject.orderIndex,
              },
              item: {
                id: chapter.id,
                containerId: subject.id,
                subjectId: subject.id,
                name: chapter.name,
                slug: chapter.slug,
                description: null,
                iconUrl: null,
                orderIndex: chapter.orderIndex,
                examSheetCount: 0,
                questionCount: chapter.questionCount,
              },
              subject: {
                id: subject.id,
                targetId: subject.targetId,
                name: subject.name,
                slug: subject.slug,
                code: subject.code,
                orderIndex: subject.orderIndex,
              },
              chapters: [
                {
                  id: chapter.id,
                  subjectId: chapter.subjectId,
                  containerItemId: chapter.containerItemId,
                  name: chapter.name,
                  slug: chapter.slug,
                  orderIndex: chapter.orderIndex,
                  topicCount: chapter.topicCount,
                  questionCount: chapter.questionCount,
                },
              ],
              examSheets: [],
            },
          };
        }
      }

      throw ApiError.notFound('Container not found');
    }

    const allItems = await this.db.query.qbContainerItems.findMany({
      where: eq(qbContainerItems.containerId, container.id),
    });

    const decodedItemSlug = decodeURIComponent(itemSlug);
    const normItemSlug = normalizeBengaliSlug(decodedItemSlug);

    let item = allItems.find(
      (i) =>
        i.slug === itemSlug ||
        i.slug === decodedItemSlug ||
        normalizeBengaliSlug(i.slug) === normItemSlug ||
        normalizeBengaliSlug(i.name) === normItemSlug,
    );

    if (!item) {
      item = allItems[0];
    }

    if (!item) {
      throw ApiError.notFound('Item not found');
    }

    let subject: SubjectRow | undefined = item.subjectId
      ? await this.db.query.qbSubjects.findFirst({ where: eq(qbSubjects.id, item.subjectId) })
      : undefined;

    if (!subject) {
      subject = await this.db.query.qbSubjects.findFirst({ where: eq(qbSubjects.slug, itemSlug) });
    }

    const matchingChapter = await this.db.query.qbChapters.findFirst({
      where: or(
        eq(qbChapters.slug, itemSlug),
        eq(qbChapters.slug, decodedItemSlug),
        eq(qbChapters.name, item.name),
      ),
    });

    let chapters = matchingChapter
      ? []
      : subject
        ? await this.db
            .select()
            .from(qbChapters)
            .where(eq(qbChapters.subjectId, subject.id))
            .orderBy(asc(qbChapters.orderIndex))
        : await this.db
            .select()
            .from(qbChapters)
            .where(eq(qbChapters.containerItemId, item.id))
            .orderBy(asc(qbChapters.orderIndex));

    const targetSourceType = TARGET_SOURCE_TYPE_MAP[target.slug];

    if (subject && targetSourceType && chapters.length > 0) {
      const chapterIds = chapters.map((chapter) => chapter.id);
      const scopedChapterCounts = await this.db
        .select({
          chapterId: qbTopics.chapterId,
          total: count(qbQuestions.id),
        })
        .from(qbQuestions)
        .innerJoin(qbTopics, eq(qbTopics.id, qbQuestions.topicId))
        .innerJoin(qbQuestionSources, eq(qbQuestionSources.questionId, qbQuestions.id))
        .innerJoin(
          qbSources,
          and(eq(qbSources.id, qbQuestionSources.sourceId), eq(qbSources.type, targetSourceType)),
        )
        .where(
          and(inArray(qbTopics.chapterId, chapterIds), eq(qbQuestions.status, 'published')),
        )
        .groupBy(qbTopics.chapterId);

      const scopedMap = new Map(scopedChapterCounts.map((row) => [row.chapterId, Number(row.total)]));
      chapters = chapters.map((chapter) => ({
        ...chapter,
        questionCount: scopedMap.get(chapter.id) ?? 0,
      }));
    }

    const examSheets = await this.db
      .select()
      .from(qbExamSheets)
      .where(eq(qbExamSheets.containerItemId, item.id))
      .orderBy(asc(qbExamSheets.orderIndex), asc(qbExamSheets.title));

    if (!matchingChapter && chapters.length === 0 && examSheets.length > 0) {
      const examSheetIds = examSheets.map((examSheet) => examSheet.id);
      const questionChapters = await this.db
        .select({
          chapterId: qbTopics.chapterId,
          qCount: count(qbExamSheetQuestions.questionId),
        })
        .from(qbExamSheetQuestions)
        .innerJoin(qbQuestions, eq(qbQuestions.id, qbExamSheetQuestions.questionId))
        .innerJoin(qbTopics, eq(qbTopics.id, qbQuestions.topicId))
        .where(inArray(qbExamSheetQuestions.examSheetId, examSheetIds))
        .groupBy(qbTopics.chapterId);

      const chapterMap = new Map(
        questionChapters.map((row) => [row.chapterId, Number(row.qCount)]),
      );
      const chapterIds = questionChapters
        .map((row) => row.chapterId)
        .filter((id): id is string => id !== null);

      if (chapterIds.length > 0) {
        const foundChapters = await this.db
          .select()
          .from(qbChapters)
          .where(inArray(qbChapters.id, chapterIds))
          .orderBy(asc(qbChapters.orderIndex), asc(qbChapters.name));

        chapters = foundChapters.map((chapter) => ({
          ...chapter,
          questionCount: chapterMap.get(chapter.id) ?? chapter.questionCount,
        }));
      }
    } else if (!matchingChapter && chapters.length === 0) {
      const questionChapters = await this.db
        .select({
          chapterId: qbTopics.chapterId,
          qCount: count(qbQuestions.id),
        })
        .from(qbQuestions)
        .innerJoin(qbTopics, eq(qbTopics.id, qbQuestions.topicId))
        .innerJoin(qbQuestionSources, eq(qbQuestionSources.questionId, qbQuestions.id))
        .innerJoin(qbSources, eq(qbSources.id, qbQuestionSources.sourceId))
        .where(and(eq(qbSources.containerItemId, item.id), eq(qbQuestions.status, 'published')))
        .groupBy(qbTopics.chapterId);

      const chapterMap = new Map(
        questionChapters.map((row) => [row.chapterId, Number(row.qCount)]),
      );
      const chapterIds = questionChapters
        .map((row) => row.chapterId)
        .filter((id): id is string => id !== null);

      if (chapterIds.length > 0) {
        const foundChapters = await this.db
          .select()
          .from(qbChapters)
          .where(inArray(qbChapters.id, chapterIds))
          .orderBy(asc(qbChapters.orderIndex), asc(qbChapters.name));

        chapters = foundChapters.map((chapter) => ({
          ...chapter,
          questionCount: chapterMap.get(chapter.id) ?? chapter.questionCount,
        }));
      }
    }

    return {
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
        chapters: chapters.map((chapter) => ({
          id: chapter.id,
          subjectId: chapter.subjectId,
          containerItemId: chapter.containerItemId,
          name: chapter.name,
          slug: chapter.slug,
          orderIndex: chapter.orderIndex,
          topicCount: chapter.topicCount,
          questionCount: chapter.questionCount,
        })),
        examSheets: examSheets.map((examSheet) => ({
          id: examSheet.id,
          containerItemId: examSheet.containerItemId,
          chapterId: examSheet.chapterId,
          title: examSheet.title,
          slug: examSheet.slug,
          examType: examSheet.examType,
          durationMinutes: examSheet.durationMinutes,
          totalMarks: examSheet.totalMarks,
          negativeMarks: examSheet.negativeMarks,
          orderIndex: examSheet.orderIndex,
          questionCount: examSheet.questionCount,
        })),
      },
    };
  }

  async getSubject(slug: string) {
    const [subject] = await this.db.select().from(qbSubjects).where(eq(qbSubjects.slug, slug));

    if (!subject) {
      throw ApiError.notFound('Subject not found');
    }

    const [target] = subject.targetId
      ? await this.db.select().from(qbTargets).where(eq(qbTargets.id, subject.targetId))
      : [];

    const chapters = await this.db
      .select()
      .from(qbChapters)
      .where(eq(qbChapters.subjectId, subject.id))
      .orderBy(asc(qbChapters.orderIndex));

    return {
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
        chapters: chapters.map((chapter) => ({
          id: chapter.id,
          subjectId: chapter.subjectId,
          name: chapter.name,
          slug: chapter.slug,
          orderIndex: chapter.orderIndex,
          questionCount: chapter.questionCount,
        })),
      },
    };
  }

  async getChapterQuestions(
    paramSubjectSlug: string,
    chapterSlug: string,
    query: ChapterQueryDto,
  ) {
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
      containerSlug,
      itemSlug,
      container: queryContainer,
      item: queryItem,
      qType,
    } = query;

    const effectiveContainerSlug = containerSlug || queryContainer;
    let activeContainer: ContainerRow | undefined;
    if (effectiveContainerSlug) {
      activeContainer = await this.db.query.qbContainers.findFirst({
        where: eq(qbContainers.slug, effectiveContainerSlug),
      });
    }

    let subject: SubjectRow | undefined = (
      await this.db.select().from(qbSubjects).where(eq(qbSubjects.slug, paramSubjectSlug))
    )[0];
    let containerItem: ContainerItemRow | undefined;

    if (!subject) {
      if (activeContainer) {
        containerItem = await this.db.query.qbContainerItems.findFirst({
          where: and(
            eq(qbContainerItems.containerId, activeContainer.id),
            eq(qbContainerItems.slug, paramSubjectSlug),
          ),
        });
      }
      if (!containerItem) {
        containerItem = await this.db.query.qbContainerItems.findFirst({
          where: eq(qbContainerItems.slug, paramSubjectSlug),
        });
      }
      if (containerItem?.subjectId) {
        subject = await this.db.query.qbSubjects.findFirst({
          where: eq(qbSubjects.id, containerItem.subjectId),
        });
      }
    }

    if (!activeContainer && containerItem) {
      activeContainer = await this.db.query.qbContainers.findFirst({
        where: eq(qbContainers.id, containerItem.containerId),
      });
    }

    if (!subject && !containerItem) {
      throw ApiError.notFound('Subject not found');
    }

    const effectiveSubject = subject ?? {
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
      ? await this.db.select().from(qbTargets).where(eq(qbTargets.id, effectiveSubject.targetId))
      : [];

    const isAll = chapterSlug === 'all';
    let chapter: ChapterRow | undefined;

    if (isAll) {
      chapter = {
        id: 'all',
        subjectId: effectiveSubject.id,
        containerItemId: containerItem?.id ?? null,
        name: 'সকল অধ্যায় / প্রশ্নপত্র',
        slug: 'all',
        orderIndex: 0,
        topicCount: 0,
        questionCount: effectiveSubject.questionCount,
      };
    } else {
      if (subject) {
        chapter = (
          await this.db
            .select()
            .from(qbChapters)
            .where(and(eq(qbChapters.subjectId, subject.id), eq(qbChapters.slug, chapterSlug)))
        )[0];
      }
      if (!chapter && containerItem) {
        chapter = await this.db.query.qbChapters.findFirst({
          where: and(
            eq(qbChapters.containerItemId, containerItem.id),
            eq(qbChapters.slug, chapterSlug),
          ),
        });
      }
    }

    if (!chapter) {
      throw ApiError.notFound('Chapter not found');
    }

    const subChapterIds = isAll
      ? subject
        ? (
            await this.db
              .select({ id: qbChapters.id })
              .from(qbChapters)
              .where(eq(qbChapters.subjectId, subject.id))
          ).map((row) => row.id)
        : []
      : chapter
        ? [chapter.id]
        : [];

    const effectiveTargetSlug = targetSlug || target?.slug;
    const targetSourceType = effectiveTargetSlug
      ? TARGET_SOURCE_TYPE_MAP[effectiveTargetSlug]
      : undefined;

    const [sourcesList, examSheetsList, chapterTopicCounts] = await Promise.all([
      containerItem
        ? this.db
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
            .where(eq(qbSources.containerItemId, containerItem.id))
            .orderBy(desc(qbSources.year), asc(qbSources.name))
        : subChapterIds.length > 0
          ? this.db
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
        ? this.db
            .select()
            .from(qbExamSheets)
            .where(eq(qbExamSheets.containerItemId, containerItem.id))
            .orderBy(asc(qbExamSheets.orderIndex), asc(qbExamSheets.title))
        : subChapterIds.length > 0
          ? this.db
              .select()
              .from(qbExamSheets)
              .where(inArray(qbExamSheets.chapterId, subChapterIds))
              .orderBy(asc(qbExamSheets.orderIndex), asc(qbExamSheets.title))
          : [],
      subChapterIds.length > 0
        ? targetSourceType
          ? this.db
              .select({
                topicId: qbQuestions.topicId,
                total: count(qbQuestions.id),
              })
              .from(qbQuestions)
              .innerJoin(
                qbTopics,
                and(
                  eq(qbTopics.id, qbQuestions.topicId),
                  inArray(qbTopics.chapterId, subChapterIds),
                ),
              )
              .innerJoin(qbQuestionSources, eq(qbQuestionSources.questionId, qbQuestions.id))
              .innerJoin(
                qbSources,
                and(
                  eq(qbSources.id, qbQuestionSources.sourceId),
                  eq(qbSources.type, targetSourceType),
                ),
              )
              .where(eq(qbQuestions.status, 'published'))
              .groupBy(qbQuestions.topicId)
          : this.db
              .select({
                topicId: qbQuestions.topicId,
                total: count(qbQuestions.id),
              })
              .from(qbQuestions)
              .innerJoin(
                qbTopics,
                and(
                  eq(qbTopics.id, qbQuestions.topicId),
                  inArray(qbTopics.chapterId, subChapterIds),
                ),
              )
              .where(eq(qbQuestions.status, 'published'))
              .groupBy(qbQuestions.topicId)
        : [],
    ]);

    const chapterTopicCountMap = new Map(
      chapterTopicCounts.map((row) => [row.topicId ?? '', Number(row.total)]),
    );

    let scopedDirectTopics: TopicRow[] = [];
    if (subChapterIds.length > 0) {
      scopedDirectTopics = await this.db
        .select()
        .from(qbTopics)
        .where(inArray(qbTopics.chapterId, subChapterIds))
        .orderBy(asc(qbTopics.orderIndex));
    }

    let topicsList: TopicRow[] = scopedDirectTopics;
    let topicQuestionCountMap = chapterTopicCountMap;

    const effectiveExamSheet = examSheet || examSheetSlug || examSheetId;
    let matchedExamSheet: (typeof examSheetsList)[number] | undefined;
    let examSheetSubjectsList: Array<{
      id: string;
      name: string;
      slug: string;
      orderIndex: number;
      questionCount: number;
    }> = [];
    let dynamicChaptersList: Array<{
      id: string;
      subjectId: string;
      name: string;
      slug: string;
      orderIndex: number;
      questionCount: number;
    }> = [];

    let activeItem = containerItem;
    let selectedSubjectRow: SubjectRow | undefined;
    let selectedChapterRow: ChapterRow | undefined;

    if (effectiveExamSheet && effectiveExamSheet !== 'all') {
      matchedExamSheet = examSheetsList.find(
        (examSheetRow) =>
          examSheetRow.id === effectiveExamSheet || examSheetRow.slug === effectiveExamSheet,
      );
      if (matchedExamSheet) {
        const examSheetQuestions = await this.db
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
          .where(eq(qbQuestions.status, 'published'));

        const examSheetTopicCounts = new Map<string, number>();
        const examSheetTopicIdSet = new Set<string>();

        for (const question of examSheetQuestions) {
          if (!question.topicId) continue;
          examSheetTopicCounts.set(
            question.topicId,
            (examSheetTopicCounts.get(question.topicId) || 0) + 1,
          );
          examSheetTopicIdSet.add(question.topicId);
        }

        const examSheetTopicIds = Array.from(examSheetTopicIdSet);
        if (examSheetTopicIds.length > 0) {
          topicsList = await this.db
            .select()
            .from(qbTopics)
            .where(inArray(qbTopics.id, examSheetTopicIds))
            .orderBy(asc(qbTopics.orderIndex));
        } else {
          topicsList = [];
        }

        topicQuestionCountMap = examSheetTopicCounts;
      }
    } else if (containerItem || activeContainer) {
      const activeItemId = containerItem?.id;
      const activeContainerId = activeContainer?.id;

      if (activeItemId || activeContainerId) {
        const itemSourceCondition = activeItemId
          ? eq(qbSources.containerItemId, activeItemId)
          : eq(qbSources.containerId, activeContainerId!);

        const aggregatedSubjects = await this.db
          .select({
            id: qbSubjects.id,
            name: qbSubjects.name,
            slug: qbSubjects.slug,
            orderIndex: qbSubjects.orderIndex,
            questionCount: count(qbQuestions.id),
          })
          .from(qbQuestions)
          .innerJoin(qbQuestionSources, eq(qbQuestionSources.questionId, qbQuestions.id))
          .innerJoin(qbSources, eq(qbSources.id, qbQuestionSources.sourceId))
          .innerJoin(qbTopics, eq(qbTopics.id, qbQuestions.topicId))
          .innerJoin(qbChapters, eq(qbChapters.id, qbTopics.chapterId))
          .innerJoin(qbSubjects, eq(qbSubjects.id, qbChapters.subjectId))
          .where(and(itemSourceCondition, eq(qbQuestions.status, 'published')))
          .groupBy(qbSubjects.id, qbSubjects.name, qbSubjects.slug, qbSubjects.orderIndex)
          .orderBy(asc(qbSubjects.orderIndex), asc(qbSubjects.name));

        examSheetSubjectsList = aggregatedSubjects.map((s) => ({
          ...s,
          questionCount: Number(s.questionCount),
        }));

        if (querySubjectSlug && querySubjectSlug !== 'all') {
          const subjectCondition = isUUID(querySubjectSlug)
            ? or(eq(qbSubjects.slug, querySubjectSlug), eq(qbSubjects.id, querySubjectSlug))
            : eq(qbSubjects.slug, querySubjectSlug);
          selectedSubjectRow = (
            await this.db
              .select()
              .from(qbSubjects)
              .where(subjectCondition)
              .limit(1)
          )[0];
        }

        if (selectedSubjectRow) {
          const aggregatedChapters = await this.db
            .select({
              id: qbChapters.id,
              subjectId: qbChapters.subjectId,
              name: qbChapters.name,
              slug: qbChapters.slug,
              orderIndex: qbChapters.orderIndex,
              questionCount: count(qbQuestions.id),
            })
            .from(qbQuestions)
            .innerJoin(qbQuestionSources, eq(qbQuestionSources.questionId, qbQuestions.id))
            .innerJoin(qbSources, eq(qbSources.id, qbQuestionSources.sourceId))
            .innerJoin(qbTopics, eq(qbTopics.id, qbQuestions.topicId))
            .innerJoin(qbChapters, eq(qbChapters.id, qbTopics.chapterId))
            .where(
              and(
                itemSourceCondition,
                eq(qbChapters.subjectId, selectedSubjectRow.id),
                eq(qbQuestions.status, 'published'),
              ),
            )
            .groupBy(
              qbChapters.id,
              qbChapters.subjectId,
              qbChapters.name,
              qbChapters.slug,
              qbChapters.orderIndex,
            )
            .orderBy(asc(qbChapters.orderIndex), asc(qbChapters.name));

          dynamicChaptersList = aggregatedChapters.map((ch) => ({
            ...ch,
            questionCount: Number(ch.questionCount),
          }));

          if (query.chapterSlug && query.chapterSlug !== 'all') {
            const chapterCondition = isUUID(query.chapterSlug)
              ? or(eq(qbChapters.slug, query.chapterSlug), eq(qbChapters.id, query.chapterSlug))
              : eq(qbChapters.slug, query.chapterSlug);
            selectedChapterRow = (
              await this.db
                .select()
                .from(qbChapters)
                .where(
                  and(
                    eq(qbChapters.subjectId, selectedSubjectRow.id),
                    chapterCondition,
                  ),
                )
                .limit(1)
            )[0];
          }

          if (selectedChapterRow) {
            const aggregatedTopics = await this.db
              .select({
                topicId: qbTopics.id,
                parentId: qbTopics.parentTopicId,
                name: qbTopics.name,
                slug: qbTopics.slug,
                orderIndex: qbTopics.orderIndex,
                questionCount: count(qbQuestions.id),
              })
              .from(qbQuestions)
              .innerJoin(qbQuestionSources, eq(qbQuestionSources.questionId, qbQuestions.id))
              .innerJoin(qbSources, eq(qbSources.id, qbQuestionSources.sourceId))
              .innerJoin(qbTopics, eq(qbTopics.id, qbQuestions.topicId))
              .where(
                and(
                  itemSourceCondition,
                  eq(qbTopics.chapterId, selectedChapterRow.id),
                  eq(qbQuestions.status, 'published'),
                ),
              )
              .groupBy(
                qbTopics.id,
                qbTopics.parentTopicId,
                qbTopics.name,
                qbTopics.slug,
                qbTopics.orderIndex,
              )
              .orderBy(asc(qbTopics.orderIndex), asc(qbTopics.name));

            const topicCountMap = new Map(
              aggregatedTopics.map((row) => [row.topicId, Number(row.questionCount)]),
            );

            topicsList = aggregatedTopics.map((t) => ({
              id: t.topicId,
              chapterId: selectedChapterRow!.id,
              parentTopicId: t.parentId,
              name: t.name,
              slug: t.slug,
              orderIndex: t.orderIndex,
              questionCount: Number(t.questionCount),
            }));

            topicQuestionCountMap = topicCountMap;
          }
        }
      }
    }

    const conditions: SQL[] = [eq(qbQuestions.status, 'published')];

    if (matchedExamSheet) {
      const questionIdsWithExamSheet = this.db
        .select({ questionId: qbExamSheetQuestions.questionId })
        .from(qbExamSheetQuestions)
        .where(eq(qbExamSheetQuestions.examSheetId, matchedExamSheet.id));
      conditions.push(inArray(qbQuestions.id, questionIdsWithExamSheet));
    } else if (subChapterIds.length > 0) {
      conditions.push(
        inArray(
          qbQuestions.topicId,
          this.db
            .select({ id: qbTopics.id })
            .from(qbTopics)
            .where(inArray(qbTopics.chapterId, subChapterIds)),
        ),
      );

      if (targetSourceType && !sourceId && !sourceType) {
        conditions.push(
          inArray(
            qbQuestions.id,
            this.db
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
    } else {
      const effectiveContainerSlug = containerSlug || queryContainer;
      const effectiveItemSlug = itemSlug || queryItem || (containerItem ? containerItem.slug : undefined);

      if (!activeContainer && effectiveContainerSlug) {
        activeContainer = await this.db.query.qbContainers.findFirst({
          where: eq(qbContainers.slug, effectiveContainerSlug),
        });
      }

      if (!activeItem && effectiveItemSlug && activeContainer) {
        activeItem = await this.db.query.qbContainerItems.findFirst({
          where: and(
            eq(qbContainerItems.containerId, activeContainer.id),
            eq(qbContainerItems.slug, effectiveItemSlug),
          ),
        });
      }

      if (activeContainer) {
        if (activeItem && activeItem.slug !== 'all') {
          conditions.push(
            inArray(
              qbQuestions.id,
              this.db
                .select({ questionId: qbQuestionSources.questionId })
                .from(qbQuestionSources)
                .innerJoin(qbSources, eq(qbSources.id, qbQuestionSources.sourceId))
                .where(eq(qbSources.containerItemId, activeItem.id)),
            ),
          );
        } else {
          conditions.push(
            inArray(
              qbQuestions.id,
              this.db
                .select({ questionId: qbQuestionSources.questionId })
                .from(qbQuestionSources)
                .innerJoin(qbSources, eq(qbSources.id, qbQuestionSources.sourceId))
                .where(eq(qbSources.containerId, activeContainer.id)),
            ),
          );
        }
      }
    }

    if (selectedSubjectRow) {
      if (selectedChapterRow) {
        conditions.push(
          inArray(
            qbQuestions.topicId,
            this.db
              .select({ id: qbTopics.id })
              .from(qbTopics)
              .where(eq(qbTopics.chapterId, selectedChapterRow.id)),
          ),
        );
      } else {
        conditions.push(
          inArray(
            qbQuestions.topicId,
            this.db
              .select({ id: qbTopics.id })
              .from(qbTopics)
              .innerJoin(qbChapters, eq(qbChapters.id, qbTopics.chapterId))
              .where(eq(qbChapters.subjectId, selectedSubjectRow.id)),
          ),
        );
      }
    }

    const effectiveTopicId = topicId && topicId !== 'all' ? topicId : undefined;
    if (effectiveTopicId) {
      conditions.push(
        or(
          eq(qbQuestions.topicId, effectiveTopicId),
          inArray(
            qbQuestions.topicId,
            this.db
              .select({ id: qbTopics.id })
              .from(qbTopics)
              .where(eq(qbTopics.parentTopicId, effectiveTopicId)),
          ),
        )!,
      );
    }

    const effectiveSource = source || sourceSlug || sourceId;
    let matchedSource: (typeof sourcesList)[number] | undefined;
    let sourceTopicCountMap: Map<string, number> | undefined;

    if (effectiveSource && effectiveSource !== 'all') {
      matchedSource = sourcesList.find(
        (sourceRow) => sourceRow.id === effectiveSource || sourceRow.slug === effectiveSource,
      );
      if (matchedSource) {
        const questionIdsWithSource = this.db
          .select({ questionId: qbQuestionSources.questionId })
          .from(qbQuestionSources)
          .where(eq(qbQuestionSources.sourceId, matchedSource.id));
        conditions.push(inArray(qbQuestions.id, questionIdsWithSource));

        const sourceTopicCounts = await this.db
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
              eq(qbQuestions.status, 'published'),
              eq(qbQuestionSources.sourceId, matchedSource.id),
            ),
          )
          .groupBy(qbQuestions.topicId);

        sourceTopicCountMap = new Map(
          sourceTopicCounts.map((row) => [row.topicId ?? '', Number(row.total)]),
        );
      }
    }

    if (sourceType) {
      const questionIdsWithSourceType = this.db
        .select({ questionId: qbQuestionSources.questionId })
        .from(qbQuestionSources)
        .innerJoin(qbSources, eq(qbQuestionSources.sourceId, qbSources.id))
        .where(eq(qbSources.type, sourceType));
      conditions.push(inArray(qbQuestions.id, questionIdsWithSourceType));
    } else if (target?.group === 'academic' && !effectiveSource) {
      const academicQuestionIds = this.db
        .select({ questionId: qbQuestionSources.questionId })
        .from(qbQuestionSources)
        .innerJoin(qbSources, eq(qbQuestionSources.sourceId, qbSources.id))
        .where(eq(qbSources.sourceGroup, 'academic'));
      conditions.push(inArray(qbQuestions.id, academicQuestionIds));
    }

    if (qType) {
      conditions.push(eq(qbQuestions.qType, qType));
    }

    if (!matchedExamSheet && sourceTopicCountMap) {
      topicQuestionCountMap = sourceTopicCountMap;
    }

    const whereClause = and(...conditions);
    const offset = (page - 1) * limit;

    const [countResult, paginatedIdRows] = await Promise.all([
      this.db.select({ total: count(qbQuestions.id) }).from(qbQuestions).where(whereClause),
      this.db
        .select({ id: qbQuestions.id })
        .from(qbQuestions)
        .where(whereClause)
        .orderBy(asc(qbQuestions.orderIndex), asc(qbQuestions.id))
        .limit(limit)
        .offset(offset),
    ]);

    const questionIds = paginatedIdRows.map((row) => row.id);
    let questionsList: MappableQuestion[] = [];

    if (questionIds.length > 0) {
      const [questions, options, parts, questionSources, topics] = await Promise.all([
        this.db
          .select()
          .from(qbQuestions)
          .where(inArray(qbQuestions.id, questionIds))
          .orderBy(asc(qbQuestions.orderIndex), asc(qbQuestions.id)),
        this.db
          .select()
          .from(qbQuestionOptions)
          .where(inArray(qbQuestionOptions.questionId, questionIds))
          .orderBy(asc(qbQuestionOptions.orderIndex)),
        this.db
          .select()
          .from(qbQuestionParts)
          .where(inArray(qbQuestionParts.questionId, questionIds))
          .orderBy(asc(qbQuestionParts.orderIndex)),
        this.db
          .select({
            questionId: qbQuestionSources.questionId,
            source: qbSources,
          })
          .from(qbQuestionSources)
          .innerJoin(qbSources, eq(qbSources.id, qbQuestionSources.sourceId))
          .where(inArray(qbQuestionSources.questionId, questionIds)),
        this.db
          .select()
          .from(qbTopics)
          .where(
            inArray(
              qbTopics.id,
              this.db
                .select({ topicId: qbQuestions.topicId })
                .from(qbQuestions)
                .where(inArray(qbQuestions.id, questionIds)),
            ),
          ),
      ]);

      const optionsMap = new Map<string, typeof options>();
      for (const opt of options) {
        const list = optionsMap.get(opt.questionId) ?? [];
        list.push(opt);
        optionsMap.set(opt.questionId, list);
      }

      const partsMap = new Map<string, typeof parts>();
      for (const part of parts) {
        const list = partsMap.get(part.questionId) ?? [];
        list.push(part);
        partsMap.set(part.questionId, list);
      }

      const sourcesMap = new Map<string, Array<{ source: (typeof questionSources)[number]['source'] }>>();
      for (const qs of questionSources) {
        const list = sourcesMap.get(qs.questionId) ?? [];
        list.push({ source: qs.source });
        sourcesMap.set(qs.questionId, list);
      }

      const topicMap = new Map(topics.map((t) => [t.id, t]));

      questionsList = questions.map((q) => ({
        ...q,
        options: optionsMap.get(q.id) ?? [],
        parts: partsMap.get(q.id) ?? [],
        questionSources: sourcesMap.get(q.id) ?? [],
        topic: q.topicId ? (topicMap.get(q.topicId) ?? null) : null,
      })) as unknown as MappableQuestion[];
    }

    const total = Number(countResult[0]?.total ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
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
        chapters: dynamicChaptersList,
        topics: topicsList.map((topic) => ({
          id: topic.id,
          parentId: topic.parentTopicId,
          name: topic.name,
          slug: topic.slug,
          orderIndex: topic.orderIndex,
          questionCount: topicQuestionCountMap.get(topic.id) ?? 0,
        })),
        sources: sourcesList.map((sourceRow) => ({
          ...sourceRow,
          questionCount: sourceRow.questionCount,
        })),
        examSheets: examSheetsList.map((examSheetRow) => ({
          id: examSheetRow.id,
          chapterId: examSheetRow.chapterId,
          title: examSheetRow.title,
          slug: examSheetRow.slug,
          examType: examSheetRow.examType,
          durationMinutes: examSheetRow.durationMinutes,
          totalMarks: examSheetRow.totalMarks,
          negativeMarks: examSheetRow.negativeMarks,
          orderIndex: examSheetRow.orderIndex,
          questionCount: examSheetRow.questionCount,
        })),
        questions: questionsList.map((question) =>
          mapQuestion(asMappable(question), { includeAnswers: true }),
        ),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    };
  }

  async getQuestion(id: string) {
    const question = await this.db.query.qbQuestions.findFirst({
      where: eq(qbQuestions.id, id),
      with: {
        options: { orderBy: [asc(qbQuestionOptions.orderIndex)] },
        parts: { orderBy: [asc(qbQuestionParts.orderIndex)] },
        questionSources: { with: { source: true } },
        topic: true,
      },
    });

    if (!question) {
      throw ApiError.notFound('Question not found');
    }

    return { success: true, data: mapQuestion(asMappable(question), { includeAnswers: true }) };
  }

  async getTree() {
    const [targetsList, containersList, containerItemsList, subjectsList, chaptersList, topicsList] =
      await Promise.all([
        this.db.select().from(qbTargets).orderBy(asc(qbTargets.orderIndex)),
        this.db.select().from(qbContainers).orderBy(asc(qbContainers.orderIndex)),
        this.db.select().from(qbContainerItems).orderBy(asc(qbContainerItems.orderIndex)),
        this.db.select().from(qbSubjects).orderBy(asc(qbSubjects.orderIndex)),
        this.db.select().from(qbChapters).orderBy(asc(qbChapters.orderIndex)),
        this.db.select().from(qbTopics).orderBy(asc(qbTopics.orderIndex)),
      ]);

    const topicsByChapter = new Map<string, typeof topicsList>();
    for (const topic of topicsList) {
      if (topic.chapterId) {
        const list = topicsByChapter.get(topic.chapterId) ?? [];
        list.push(topic);
        topicsByChapter.set(topic.chapterId, list);
      }
    }

    const itemsByContainer = new Map<string, typeof containerItemsList>();
    for (const item of containerItemsList) {
      const list = itemsByContainer.get(item.containerId) ?? [];
      list.push(item);
      itemsByContainer.set(item.containerId, list);
    }

    const containersByTarget = new Map<string, typeof containersList>();
    for (const container of containersList) {
      const list = containersByTarget.get(container.targetId) ?? [];
      list.push(container);
      containersByTarget.set(container.targetId, list);
    }

    const subjectsByTarget = new Map<string, typeof subjectsList>();
    for (const subject of subjectsList) {
      if (subject.targetId) {
        const list = subjectsByTarget.get(subject.targetId) ?? [];
        list.push(subject);
        subjectsByTarget.set(subject.targetId, list);
      }
    }

    const chaptersBySubject = new Map<string, typeof chaptersList>();
    for (const chapter of chaptersList) {
      const list = chaptersBySubject.get(chapter.subjectId) ?? [];
      list.push(chapter);
      chaptersBySubject.set(chapter.subjectId, list);
    }

    const mapSubject = (subject: (typeof subjectsList)[number]) => {
      const chapters = (chaptersBySubject.get(subject.id) ?? []).map((chapter) => {
        const topics = (topicsByChapter.get(chapter.id) ?? []).map((topic) => ({
          id: topic.id,
          name: topic.name,
          slug: topic.slug,
          questionCount: topic.questionCount,
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
    };

    const treeTargets = targetsList.map((target) => {
      const containers = (containersByTarget.get(target.id) ?? []).map((container) => {
        const items = (itemsByContainer.get(container.id) ?? []).map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          questionCount: item.questionCount,
        }));
        return {
          id: container.id,
          name: container.name,
          slug: container.slug,
          itemCount: container.itemCount,
          questionCount: container.questionCount,
          items,
        };
      });

      const targetSubjects = subjectsByTarget.get(target.id);
      const effectiveSubjects =
        targetSubjects && targetSubjects.length > 0 ? targetSubjects : subjectsList;
      const subjects = effectiveSubjects.map(mapSubject);

      return {
        id: target.id,
        group: target.group,
        name: target.name,
        slug: target.slug,
        containers,
        subjects,
      };
    });

    const allFormattedSubjects = subjectsList.map(mapSubject);

    return {
      success: true,
      data: {
        targets: treeTargets,
        subjects: allFormattedSubjects,
      },
    };
  }

  async bulkImport(body: BulkImportDto) {
    const { subjectId, chapterId, sourceId, topics, questions } = body;

    const chapter = await this.db.query.qbChapters.findFirst({
      where: and(eq(qbChapters.id, chapterId), eq(qbChapters.subjectId, subjectId)),
    });

    if (!chapter) {
      throw ApiError.notFound(`Chapter '${chapterId}' not found for subject '${subjectId}'`);
    }

    const topicSlugToId = new Map<string, string>();

    if (topics && topics.length > 0) {
      for (const topic of topics) {
        const slug =
          topic.slug ||
          topic.name
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, '-')
            .replace(/^-+|-+$/g, '');

        const [existing] = await this.db
          .select({ id: qbTopics.id })
          .from(qbTopics)
          .where(eq(qbTopics.slug, slug));

        if (existing) {
          topicSlugToId.set(slug, existing.id);
          if (topic.id) topicSlugToId.set(topic.id, existing.id);
        } else {
          const newId = uuidv7();
          await this.db.insert(qbTopics).values({
            id: newId,
            chapterId,
            parentTopicId: topic.parentId ?? topic.parentTopicId ?? null,
            name: topic.name,
            slug,
            orderIndex: topic.orderIndex ?? 1,
          });
          topicSlugToId.set(slug, newId);
          if (topic.id) topicSlugToId.set(topic.id, newId);
        }
      }
    }

    const createdQuestionIds: string[] = [];

    await Promise.all(
      questions.map(async (question, index) => {
        const questionId = question.id || uuidv7();
        const orderIndex = question.orderIndex ?? index + 1;

        const cleanedQuestionText = cleanAndFormatMathText(question.questionText);
        const cleanedContextText = question.contextText
          ? cleanAndFormatMathText(question.contextText)
          : null;
        const cleanedExplanation = question.explanation
          ? cleanAndFormatMathText(question.explanation)
          : null;

        let resolvedTopicId: string | null = null;
        if (question.topicId) {
          resolvedTopicId = topicSlugToId.get(question.topicId) ?? null;
          if (
            !resolvedTopicId &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(question.topicId)
          ) {
            resolvedTopicId = question.topicId;
          }
        }

        await this.db
          .insert(qbQuestions)
          .values({
            id: questionId,
            topicId: resolvedTopicId,
            qType: question.qType,
            questionText: cleanedQuestionText,
            contextText: cleanedContextText,
            explanation: cleanedExplanation,
            status: 'published',
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

        if (question.qType === 'mcq' && question.options && question.options.length > 0) {
          await Promise.all(
            question.options.map(async (option, optionIndex) => {
              const optionId = option.id || uuidv7();
              const optionOrderIndex = option.orderIndex ?? optionIndex;
              const cleanedOptionText = cleanAndFormatMathText(option.optionText);
              await this.db
                .insert(qbQuestionOptions)
                .values({
                  id: optionId,
                  questionId,
                  optionText: cleanedOptionText,
                  isCorrect: option.isCorrect,
                  orderIndex: optionOrderIndex,
                })
                .onConflictDoUpdate({
                  target: [qbQuestionOptions.id],
                  set: {
                    optionText: cleanedOptionText,
                    isCorrect: option.isCorrect,
                  },
                });
            }),
          );
        }

        if (question.qType === 'written' && question.parts && question.parts.length > 0) {
          await Promise.all(
            question.parts.map(async (part, partIndex) => {
              const partId = part.id || uuidv7();
              const partOrderIndex = part.orderIndex ?? partIndex;
              const cleanedPartText = cleanAndFormatMathText(part.partText);
              const cleanedPartAnswer = part.answerText
                ? cleanAndFormatMathText(part.answerText)
                : null;
              const marks =
                part.marks !== undefined && part.marks !== null ? String(part.marks) : '5';
              await this.db
                .insert(qbQuestionParts)
                .values({
                  id: partId,
                  questionId,
                  partText: cleanedPartText,
                  answerText: cleanedPartAnswer,
                  marks,
                  orderIndex: partOrderIndex,
                })
                .onConflictDoUpdate({
                  target: [qbQuestionParts.questionId, qbQuestionParts.orderIndex],
                  set: {
                    partText: cleanedPartText,
                    answerText: cleanedPartAnswer,
                    marks,
                  },
                });
            }),
          );
        }

        const targetSourceId = question.sourceId || sourceId;
        if (targetSourceId) {
          await this.db
            .insert(qbQuestionSources)
            .values({ questionId, sourceId: targetSourceId })
            .onConflictDoNothing();
        }
      }),
    );

    return {
      success: true,
      data: {
        importedCount: questions.length,
        questionIds: createdQuestionIds,
      },
    };
  }
}

export { PUBLIC_CACHE_CONTROL };
