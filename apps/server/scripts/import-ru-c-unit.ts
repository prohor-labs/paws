import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as cheerio from "cheerio";
import {
  qbTargets,
  qbContainers,
  qbContainerItems,
  qbSubjects,
  qbChapters,
  qbTopics,
  qbQuestions,
  qbQuestionOptions,
  qbSources,
  qbQuestionSources
} from "../src/common/database/schema/qb.js";
import { eq, sql } from "drizzle-orm";
import { recalculateAllCounts } from "../src/modules/qb/qb-count.js";

const BASE_URL = "https://studyclubd.com/view-question1/";
const AJAX_URL = "https://studyclubd.com/qb-archive/includes/ajax.php";
const UNIV_CODE = "UNI_HSQQTE";
const UNIT_CODE = "UNI_d8e1d188";

const RU_C_ALL_SUBJECTS = [
  { code: "SUB_7f8e22c1", name: "উচ্চতর গণিত প্রথম পত্র", slug: "উচ্চতর-গণিত-প্রথম-পত্র-sub_7f8e22c1" },
  { code: "SUB_57c463da", name: "রসায়ন দ্বিতীয় পত্র", slug: "রসায়ন-দ্বিতীয়-পত্র-sub_57c463da" },
  { code: "SUB_13b6cb76", name: "উচ্চতর গণিত দ্বিতীয় পত্র", slug: "উচ্চতর-গণিত-দ্বিতীয়-পত্র-sub_13b6cb76" },
  { code: "SUB_3d982a22", name: "জীববিজ্ঞান প্রথম পত্র", slug: "জীববিজ্ঞান-প্রথম-পত্র-sub_3d982a22" },
  { code: "SUB_b7d3a5b7", name: "জীববিজ্ঞান দ্বিতীয় পত্র", slug: "জীববিজ্ঞান-দ্বিতীয়-পত্র-sub_b7d3a5b7" },
  { code: "SUB_2a8512fd", name: "পদার্থবিজ্ঞান দ্বিতীয় পত্র", slug: "পদার্থবিজ্ঞান-দ্বিতীয়-পত্র-sub_2a8512fd" },
  { code: "SUB_599bd423", name: "পদার্থবিজ্ঞান প্রথম পত্র", slug: "পদার্থবিজ্ঞান-প্রথম-পত্র-sub_599bd423" },
  { code: "SUB_2a4adee4", name: "রসায়ন প্রথম পত্র", slug: "রসায়ন-প্রথম-পত্র-sub_2a4adee4" },
  { code: "SUB_395b46c5", name: "তথ্য ও যোগাযোগ প্রযুক্তি", slug: "তথ্য-ও-যোগাযোগ-প্রযুক্তি-sub_395b46c5" }
];

interface ScrapedOption {
  label: string;
  text: string;
  isCorrect: boolean;
}

interface ScrapedQuestion {
  dbId: string | null;
  number: string;
  questionText: string;
  meta: string;
  options: ScrapedOption[];
}

interface TopicTask {
  subjectCode: string;
  subjectName: string;
  chapterCode: string;
  chapterName: string;
  topicCode: string;
  topicName: string;
  dbTopicId: string;
}

function normalizeKey(str: string): string {
  return str.replace(/\s+/g, "").toLowerCase().trim();
}

function parseAndDeduplicateMetaTags(metaStr: string) {
  const rawMatches = metaStr.match(/\[(.*?)\]/g) || [];
  const uniqueTags = new Set<string>();
  const parsedSources: { institution: string; unit?: string; year?: number }[] = [];

  for (const raw of rawMatches) {
    const clean = raw.replace(/[\[\]]/g, "").trim();
    if (uniqueTags.has(clean)) continue;
    uniqueTags.add(clean);

    const parts = clean.split(":").map(p => p.trim());
    const institution = parts[0] || "RU";
    let unit: string | undefined = "Unit-C";
    let year: number | undefined;

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      const yNum = parseInt(part.replace(/\D/g, ""));
      if (!isNaN(yNum) && yNum > 1900 && yNum < 2100) {
        year = yNum;
      } else if (part.toLowerCase().includes("unit") || part.toLowerCase().includes("set")) {
        unit = part;
      }
    }

    parsedSources.push({
      institution,
      unit: "Unit-C",
      year
    });
  }

  return parsedSources;
}

async function fetchQuestions(params: {
  subject: string;
  chapter?: string;
  topic?: string;
  page: number;
}, retries = 3): Promise<{ questions: ScrapedQuestion[]; hasMore: boolean }> {
  const query = new URLSearchParams({
    university: UNIV_CODE,
    unit: UNIT_CODE,
    subject: params.subject,
    ...(params.chapter ? { chapter: params.chapter } : {}),
    ...(params.topic ? { topic: params.topic } : {}),
    spa_ajax: "1",
    page: params.page.toString()
  });

  for (let r = 0; r < retries; r++) {
    try {
      const res = await fetch(`${BASE_URL}?${query.toString()}`, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const $ = cheerio.load(data.html || "");

      const questions: ScrapedQuestion[] = [];
      $(".mcq-item").each((_, el) => {
        const item = $(el);
        const dbId = item.attr("data-db-id") || null;
        const qTextEl = item.find(".mcq-question-text");
        const number = qTextEl.find(".question-number").text().trim();
        const qLink = qTextEl.find("a.spa-link");
        const questionText = qLink.text().trim() || qTextEl.text().replace(number, "").trim();
        const meta = item.find(".mcq-meta").text().trim();

        const options: ScrapedOption[] = [];
        item.find(".mcq-option-btn").each((_, optEl) => {
          const opt = $(optEl);
          options.push({
            label: opt.find(".opt-circle").text().trim(),
            text: opt.find(".opt-text").text().trim(),
            isCorrect: opt.attr("data-is-correct") === "true"
          });
        });

        if (questionText) {
          questions.push({ dbId, number, questionText, meta, options });
        }
      });

      return {
        questions,
        hasMore: data.has_more === true || (data.total_pages && params.page < data.total_pages)
      };
    } catch (e) {
      if (r === retries - 1) {
        return { questions: [], hasMore: false };
      }
      await new Promise(res => setTimeout(res, 250 * (r + 1)));
    }
  }

  return { questions: [], hasMore: false };
}

async function main() {
  const dbUrl = process.env.DATABASE_URL || "postgresql://paws:df8f13a4@127.0.0.1:5432/paws";
  const client = postgres(dbUrl, { max: 25 });
  const db = drizzle(client);

  const [target] = await db.insert(qbTargets).values({
    group: "admission",
    name: "Varsity Admission",
    slug: "varsity-admission",
    orderIndex: 1
  }).onConflictDoUpdate({
    target: qbTargets.slug,
    set: { name: "Varsity Admission" }
  }).returning();

  const [container] = await db.insert(qbContainers).values({
    targetId: target.id,
    name: "Rajshahi University Question Bank",
    slug: "ru-question-bank",
    description: "Rajshahi University past admission test question bank",
    orderIndex: 2
  }).onConflictDoUpdate({
    target: [qbContainers.targetId, qbContainers.slug],
    set: { name: "Rajshahi University Question Bank" }
  }).returning();

  const [containerItem] = await db.insert(qbContainerItems).values({
    containerId: container.id,
    name: "C Unit (বিজ্ঞান অনুষদ)",
    slug: "c-unit",
    description: "RU C Unit Admission Question Archive (All 100% Subjects)",
    orderIndex: 3
  }).onConflictDoUpdate({
    target: [qbContainerItems.containerId, qbContainerItems.slug],
    set: { name: "C Unit (বিজ্ঞান অনুষদ)", orderIndex: 3 }
  }).returning();

  console.log(`Container item initialized: ${containerItem.name} (${containerItem.id})`);

  const oldRUQ = await client`
    SELECT distinct q.id
    FROM qb_questions q
    JOIN qb_question_sources qs ON qs.question_id = q.id
    JOIN qb_sources s ON s.id = qs.source_id
    WHERE s.container_item_id = ${containerItem.id};
  `;

  if (oldRUQ.length > 0) {
    const oldIds = oldRUQ.map(r => r.id);
    await client`DELETE FROM qb_question_sources WHERE question_id = ANY(${oldIds})`;
    await client`DELETE FROM qb_question_options WHERE question_id = ANY(${oldIds})`;
    await client`DELETE FROM qb_questions WHERE id = ANY(${oldIds})`;
  }

  await client`DELETE FROM qb_sources WHERE container_item_id = ${containerItem.id}`;

  const subjectMap = new Map<string, string>();
  const defaultTopicMap = new Map<string, string>();

  for (const cs of RU_C_ALL_SUBJECTS) {
    let [dbSub] = await db.select().from(qbSubjects).where(eq(qbSubjects.code, cs.code));
    if (!dbSub) {
      [dbSub] = await db.select().from(qbSubjects).where(eq(qbSubjects.slug, cs.slug));
    }
    if (!dbSub) {
      [dbSub] = await db.insert(qbSubjects).values({
        name: cs.name,
        slug: cs.slug,
        code: cs.code,
        targetId: target.id,
        level: "admission"
      }).returning();
    }
    subjectMap.set(cs.code, dbSub.id);

    let [defaultChapter] = await db.select().from(qbChapters).where(eq(qbChapters.subjectId, dbSub.id));
    if (!defaultChapter) {
      [defaultChapter] = await db.insert(qbChapters).values({
        subjectId: dbSub.id,
        name: "সাধারণ অধ্যায়",
        slug: "general",
        containerItemId: containerItem.id
      }).returning();
    }

    let [defaultTopic] = await db.select().from(qbTopics).where(eq(qbTopics.chapterId, defaultChapter.id));
    if (!defaultTopic) {
      [defaultTopic] = await db.insert(qbTopics).values({
        chapterId: defaultChapter.id,
        name: "সাধারণ টপিক",
        slug: "general-topic"
      }).returning();
    }
    defaultTopicMap.set(cs.code, defaultTopic.id);
  }

  const dbChapters = await db.select().from(qbChapters);
  const dbTopics = await db.select().from(qbTopics);

  const chapterMap = new Map<string, string>();
  dbChapters.forEach(c => {
    chapterMap.set(`${c.subjectId}:${c.name}`, c.id);
    chapterMap.set(`${c.subjectId}:${c.slug}`, c.id);
  });

  const topicMap = new Map<string, string>();
  dbTopics.forEach(t => {
    topicMap.set(`${t.chapterId}:${t.name}`, t.id);
    topicMap.set(`${t.chapterId}:${t.slug}`, t.id);
    topicMap.set(t.slug, t.id);
  });

  console.log("Discovering all topics across RU C Unit subjects concurrently...");
  const topicTasks: TopicTask[] = [];

  await Promise.all(RU_C_ALL_SUBJECTS.map(async (cs) => {
    const subDbId = subjectMap.get(cs.code)!;
    const chapRes = await fetch(`${AJAX_URL}?ajax=1&step=chapters&university=${UNIV_CODE}&unit=${UNIT_CODE}&subject=${cs.code}`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    });
    const chapData = await chapRes.json();
    const $c = cheerio.load(chapData.html || "");

    const chapCards = $c(".border.border-gray-100").toArray();
    const chapList: { code: string; name: string }[] = [];

    for (const cEl of chapCards) {
      const cHeader = $c(cEl).find(".flex.justify-between").first();
      const cOnclick = cHeader.attr("onclick") || "";
      const matchChap = cOnclick.match(/CHA_[a-zA-Z0-9]+/);
      if (matchChap) {
        chapList.push({
          code: matchChap[0],
          name: cHeader.find("span.font-semibold").text().trim()
        });
      }
    }

    await Promise.all(chapList.map(async (chap) => {
      const chapCode = chap.code;
      const rawChapName = chap.name;
      const chapSlug = chapCode.toLowerCase().replace(/_/g, "-");

      let chapDbId = chapterMap.get(`${subDbId}:${rawChapName}`) || chapterMap.get(`${subDbId}:${chapSlug}`);
      if (!chapDbId) {
        const [newChap] = await db.insert(qbChapters).values({
          subjectId: subDbId,
          name: rawChapName,
          slug: chapSlug,
          containerItemId: containerItem.id
        }).onConflictDoUpdate({
          target: [qbChapters.subjectId, qbChapters.slug],
          set: { name: rawChapName }
        }).returning({ id: qbChapters.id });
        chapDbId = newChap.id;
        chapterMap.set(`${subDbId}:${rawChapName}`, chapDbId);
        chapterMap.set(`${subDbId}:${chapSlug}`, chapDbId);
      }

      const topRes = await fetch(`${AJAX_URL}?ajax=1&step=topics&university=${UNIV_CODE}&unit=${UNIT_CODE}&subject=${cs.code}&chapter=${chapCode}`, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
      });
      const topData = await topRes.json();
      const $t = cheerio.load(topData.html || "");

      const topicCards = $t(".flex.justify-between").toArray();
      for (const tEl of topicCards) {
        const btn = $t(tEl).find("button");
        const tOnclick = btn.attr("onclick") || "";
        const matchTop = tOnclick.match(/TOP_[a-zA-Z0-9]+/);
        if (matchTop) {
          const topCode = matchTop[0];
          const topName = $t(tEl).find("span.truncate").text().trim() || topCode;
          const topSlug = topCode.toLowerCase().replace(/_/g, "-");

          let topDbId = topicMap.get(`${chapDbId}:${topName}`) || topicMap.get(`${chapDbId}:${topSlug}`) || topicMap.get(topSlug);
          if (!topDbId) {
            const [newTop] = await db.insert(qbTopics).values({
              chapterId: chapDbId,
              name: topName,
              slug: topSlug
            }).onConflictDoUpdate({
              target: [qbTopics.chapterId, qbTopics.slug],
              set: { name: topName }
            }).returning({ id: qbTopics.id });
            topDbId = newTop.id;
            topicMap.set(`${chapDbId}:${topName}`, topDbId);
            topicMap.set(`${chapDbId}:${topSlug}`, topDbId);
            topicMap.set(topSlug, topDbId);
          }

          topicTasks.push({
            subjectCode: cs.code,
            subjectName: cs.name,
            chapterCode: chapCode,
            chapterName: rawChapName,
            topicCode: topCode,
            topicName: topName,
            dbTopicId: topDbId
          });
        }
      }
    }));
  }));

  console.log(`Discovered ${topicTasks.length} specific topic queues. Starting Pass 1 (Topic-level extraction)...`);

  const seenQuestions = new Set<string>();
  const sourceCache = new Map<string, string>();
  let totalImportedQuestions = 0;
  let totalImportedOptions = 0;
  let totalSourcesLinked = 0;

  const workerCount = 14;
  let topicTaskIndex = 0;

  async function topicWorker() {
    while (topicTaskIndex < topicTasks.length) {
      const task = topicTasks[topicTaskIndex++];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const result = await fetchQuestions({
          subject: task.subjectCode,
          chapter: task.chapterCode,
          topic: task.topicCode,
          page
        });

        if (result.questions.length === 0) break;

        for (const q of result.questions) {
          const qKey = normalizeKey(q.questionText);
          if (seenQuestions.has(qKey)) continue;
          seenQuestions.add(qKey);

          try {
            const [qRow] = await db.insert(qbQuestions).values({
              topicId: task.dbTopicId,
              qType: "mcq",
              questionText: q.questionText,
              status: "published",
              orderIndex: parseInt(q.number) || 0
            }).returning({ id: qbQuestions.id });

            totalImportedQuestions++;

            for (let i = 0; i < q.options.length; i++) {
              const opt = q.options[i];
              await db.insert(qbQuestionOptions).values({
                questionId: qRow.id,
                optionText: opt.text || opt.label || "N/A",
                isCorrect: opt.isCorrect,
                orderIndex: i
              });
              totalImportedOptions++;
            }

            const metaList = parseAndDeduplicateMetaTags(q.meta);
            const effectiveMetaList = metaList.length > 0 ? metaList : [{ institution: "RU", unit: "Unit-C", year: undefined }];

            for (const meta of effectiveMetaList) {
              const sSlug = `${meta.institution}-${meta.unit || "unit-c"}-${meta.year || "all"}`.toLowerCase().replace(/[^\w-]/g, "-");
              let sourceId = sourceCache.get(sSlug);
              if (!sourceId) {
                const [srcRow] = await db.insert(qbSources).values({
                  containerId: container.id,
                  containerItemId: containerItem.id,
                  sourceGroup: "admission",
                  type: "university",
                  name: `${meta.institution} ${meta.unit || ""} ${meta.year || ""}`.trim(),
                  slug: sSlug,
                  institution: meta.institution,
                  unit: meta.unit,
                  year: meta.year,
                  questionCount: 0
                }).onConflictDoUpdate({
                  target: qbSources.slug,
                  set: { name: `${meta.institution} ${meta.unit || ""} ${meta.year || ""}`.trim() }
                }).returning({ id: qbSources.id });
                sourceId = srcRow.id;
                sourceCache.set(sSlug, sourceId);
              }

              await db.insert(qbQuestionSources).values({
                questionId: qRow.id,
                sourceId: sourceId
              }).onConflictDoNothing();

              totalSourcesLinked++;
            }
          } catch (err) {
          }
        }

        hasMore = result.hasMore;
        page++;
      }
    }
  }

  const topicWorkers = Array.from({ length: workerCount }, () => topicWorker());
  await Promise.all(topicWorkers);

  console.log(`Pass 1 completed. Questions with specific topics: ${totalImportedQuestions}`);
  console.log(`Starting Pass 2 (Subject-level sweep across all 18 subjects)...`);

  for (const cs of RU_C_ALL_SUBJECTS) {
    const fallbackTopicId = defaultTopicMap.get(cs.code)!;
    let page = 1;
    let hasMore = true;
    let subjectSweepCount = 0;

    while (hasMore) {
      const result = await fetchQuestions({
        subject: cs.code,
        page
      });

      if (result.questions.length === 0) break;

      for (const q of result.questions) {
        const qKey = normalizeKey(q.questionText);
        if (seenQuestions.has(qKey)) continue;
        seenQuestions.add(qKey);

        try {
          const [qRow] = await db.insert(qbQuestions).values({
            topicId: fallbackTopicId,
            qType: "mcq",
            questionText: q.questionText,
            status: "published",
            orderIndex: parseInt(q.number) || 0
          }).returning({ id: qbQuestions.id });

          totalImportedQuestions++;
          subjectSweepCount++;

          for (let i = 0; i < q.options.length; i++) {
            const opt = q.options[i];
            await db.insert(qbQuestionOptions).values({
              questionId: qRow.id,
              optionText: opt.text || opt.label || "N/A",
              isCorrect: opt.isCorrect,
              orderIndex: i
            });
            totalImportedOptions++;
          }

          const metaList = parseAndDeduplicateMetaTags(q.meta);
          const effectiveMetaList = metaList.length > 0 ? metaList : [{ institution: "RU", unit: "Unit-C", year: undefined }];

          for (const meta of effectiveMetaList) {
            const sSlug = `${meta.institution}-${meta.unit || "unit-c"}-${meta.year || "all"}`.toLowerCase().replace(/[^\w-]/g, "-");
            let sourceId = sourceCache.get(sSlug);
            if (!sourceId) {
              const [srcRow] = await db.insert(qbSources).values({
                containerId: container.id,
                containerItemId: containerItem.id,
                sourceGroup: "admission",
                type: "university",
                name: `${meta.institution} ${meta.unit || ""} ${meta.year || ""}`.trim(),
                slug: sSlug,
                institution: meta.institution,
                unit: meta.unit,
                year: meta.year,
                questionCount: 0
              }).onConflictDoUpdate({
                target: qbSources.slug,
                set: { name: `${meta.institution} ${meta.unit || ""} ${meta.year || ""}`.trim() }
              }).returning({ id: qbSources.id });
              sourceId = srcRow.id;
              sourceCache.set(sSlug, sourceId);
            }

            await db.insert(qbQuestionSources).values({
              questionId: qRow.id,
              sourceId: sourceId
            }).onConflictDoNothing();

            totalSourcesLinked++;
          }
        } catch (err) {
        }
      }

      hasMore = result.hasMore;
      page++;
    }

    if (subjectSweepCount > 0) {
      console.log(`Pass 2 swept ${cs.name}: Added ${subjectSweepCount} untagged questions.`);
    }
  }

  await recalculateAllCounts(db);

  console.log(`\n🎉 RU C Unit Complete: Total ${totalImportedQuestions} questions, ${totalImportedOptions} options, ${totalSourcesLinked} source links.`);
  await client.end();
}

main().catch(console.error);
