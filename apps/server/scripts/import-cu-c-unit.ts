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
const UNIV_CODE = "UNI_5WRL0D";
const UNIT_CODE = "UNI_d8e1d188";

const CU_C_ALL_SUBJECTS = [
  { code: "SUB_22eb0d02", name: "ইংরেজি - গ্রামার ও ভোকাবুলারি", slug: "ইংরেজি-গ্রামার-ও-ভোকাবুলারি-sub_22eb0d02" },
  { code: "SUB_8d4e39dd", name: "হিসাববিজ্ঞান প্রথম পত্র", slug: "হিসাববিজ্ঞান-প্রথম-পত্র-sub_8d4e39dd" },
  { code: "SUB_c8f404fb", name: "হিসাববিজ্ঞান দ্বিতীয় পত্র", slug: "হিসাববিজ্ঞান-দ্বিতীয়-পত্র-sub_c8f404fb" },
  { code: "SUB_7d326978", name: "ব্যবসায় সংগঠন ও ব্যবস্থাপনা প্রথম পত্র", slug: "ব্যবসায়-সংগঠন-ও-ব্যবস্থাপনা-প্রথম-পত্র-sub_7d326978" },
  { code: "SUB_b7bc3b04", name: "ব্যবসায় সংগঠন ও ব্যবস্থাপনা দ্বিতীয় পত্র", slug: "ব্যবসায়-সংগঠন-ও-ব্যবস্থাপনা-দ্বিতীয়-পত্র-sub_b7bc3b04" },
  { code: "SUB_3071aaff", name: "ফিন্যান্স, ব্যাংকিং ও বীমা প্রথম পত্র", slug: "ফিন্যান্স-ব্যাংকিং-ও-বীমা-প্রথম-পত্র-sub_3071aaff" },
  { code: "SUB_4b4fab51", name: "ফিন্যান্স, ব্যাংকিং ও বীমা দ্বিতীয় পত্র", slug: "ফিন্যান্স-ব্যাংকিং-ও-বীমা-দ্বিতীয়-পত্র-sub_4b4fab51" },
  { code: "SUB_0dddb111", name: "উৎপাদন ব্যবস্থাপনা ও বিপণন প্রথম পত্র", slug: "উৎপাদন-ব্যবস্থাপনা-ও-বিপণন-প্রথম-পত্র-sub_0dddb111" },
  { code: "SUB_7ad38d05", name: "উৎপাদন ব্যবস্থাপনা ও বিপণন দ্বিতীয় পত্র", slug: "উৎপাদন-ব্যবস্থাপনা-ও-বিপণন-দ্বিতীয়-পত্র-sub_7ad38d05" },
  { code: "SUB_8a1edb7b", name: "বাংলা ব্যাকরন", slug: "বাংলা-ব্যাকরন-sub_8a1edb7b" },
  { code: "SUB_af941852", name: "বাংলা সাহিত্য", slug: "বাংলা-সাহিত্য-sub_af941852" }
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
    const institution = parts[0] || "CU";
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
      await new Promise((resolve) => setTimeout(resolve, 300 * (r + 1)));
    }
  }
  return { questions: [], hasMore: false };
}

async function main() {
  const connectionString = "postgresql://paws:df8f13a4@127.0.0.1:5432/paws";
  const client = postgres(connectionString);
  const db = drizzle(client);

  const [target] = await db.insert(qbTargets).values({
    name: "Varsity Admission",
    slug: "varsity-admission",
    group: "admission"
  }).onConflictDoUpdate({
    target: qbTargets.slug,
    set: { name: "Varsity Admission" }
  }).returning();

  const [container] = await db.insert(qbContainers).values({
    targetId: target.id,
    name: "Chittagong University Question Bank",
    slug: "cu-question-bank",
    description: "Chittagong University past admission test question bank",
    orderIndex: 3
  }).onConflictDoUpdate({
    target: [qbContainers.targetId, qbContainers.slug],
    set: { name: "Chittagong University Question Bank" }
  }).returning();

  const [containerItem] = await db.insert(qbContainerItems).values({
    containerId: container.id,
    name: "C Unit (ব্যবসায় প্রশাসন অনুষদ)",
    slug: "c-unit",
    description: "CU C Unit Business Administration Admission Question Archive",
    orderIndex: 3
  }).onConflictDoUpdate({
    target: [qbContainerItems.containerId, qbContainerItems.slug],
    set: { name: "C Unit (ব্যবসায় প্রশাসন অনুষদ)", orderIndex: 3 }
  }).returning();

  console.log(`Container item initialized: ${containerItem.name} (${containerItem.id})`);

  const oldCUQ = await client`
    SELECT distinct q.id
    FROM qb_questions q
    JOIN qb_question_sources qs ON qs.question_id = q.id
    JOIN qb_sources s ON s.id = qs.source_id
    WHERE s.container_item_id = ${containerItem.id};
  `;

  if (oldCUQ.length > 0) {
    const oldIds = oldCUQ.map(r => r.id);
    await client`DELETE FROM qb_question_sources WHERE question_id = ANY(${oldIds})`;
    await client`DELETE FROM qb_question_options WHERE question_id = ANY(${oldIds})`;
    await client`DELETE FROM qb_questions WHERE id = ANY(${oldIds})`;
  }

  await client`DELETE FROM qb_sources WHERE container_item_id = ${containerItem.id}`;

  const subjectMap = new Map<string, string>();
  const defaultTopicMap = new Map<string, string>();

  for (const cs of CU_C_ALL_SUBJECTS) {
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

  console.log("Discovering all topics across CU C Unit subjects concurrently...");
  const topicTasks: TopicTask[] = [];

  await Promise.all(CU_C_ALL_SUBJECTS.map(async (cs) => {
    const subDbId = subjectMap.get(cs.code)!;
    const chapRes = await fetch(`${AJAX_URL}?ajax=1&step=chapters&university=${UNIV_CODE}&unit=${UNIT_CODE}&subject=${cs.code}`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    });
    const chapData = (await chapRes.json()) as { html?: string };
    const $c = cheerio.load(chapData.html || "");

    const chapList: { code: string; name: string }[] = [];

    $c("a, div[onclick], button").each((_, el) => {
      const onclick = $c(el).attr("onclick") || $c(el).attr("href") || "";
      const matchChap = onclick.match(/chapter=([^&'"\)]+)/);
      if (matchChap && !chapList.some(c => c.code === matchChap[1])) {
        const rawName = $c(el).text().replace(/\s+/g, " ").trim();
        chapList.push({
          code: matchChap[1],
          name: rawName
        });
      }
    });

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
      const topData = (await topRes.json()) as { html?: string };
      const $t = cheerio.load(topData.html || "");

      const rawTopics: { code: string; name: string }[] = [];
      $t("a, div[onclick], button").each((_, tEl) => {
        const onclick = $t(tEl).attr("onclick") || $t(tEl).attr("href") || "";
        const matchTop = onclick.match(/topic=([^&'"\)]+)/);
        if (matchTop && !rawTopics.some(rt => rt.code === matchTop[1])) {
          const topCode = matchTop[1];
          const topName = $t(tEl).text().replace(/\s+/g, " ").trim();
          rawTopics.push({ code: topCode, name: topName });
        }
      });

      for (const rt of rawTopics) {
        const topCode = rt.code;
        const topName = rt.name;
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
            const effectiveMetaList = metaList.length > 0 ? metaList : [{ institution: "CU", unit: "Unit-C", year: undefined }];

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
  console.log(`Starting Pass 2 (Subject-level sweep across all ${CU_C_ALL_SUBJECTS.length} core subjects)...`);

  for (const cs of CU_C_ALL_SUBJECTS) {
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
          const effectiveMetaList = metaList.length > 0 ? metaList : [{ institution: "CU", unit: "Unit-C", year: undefined }];

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

  console.log(`\n🎉 CU C Unit Complete: Total ${totalImportedQuestions} questions, ${totalImportedOptions} options, ${totalSourcesLinked} source links.`);
  await client.end();
}

main().catch(console.error);
