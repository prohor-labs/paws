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
import { eq } from "drizzle-orm";
import { recalculateAllCounts } from "../src/modules/qb/qb-count.js";

const BASE_URL = "https://studyclubd.com/view-question1/";
const AJAX_URL = "https://studyclubd.com/qb-archive/includes/ajax.php";
const UNIV_CODE = "UNI_W9MU53";

interface FacultyConfig {
  unitCode: string;
  itemSlug: string;
  itemName: string;
  itemDesc: string;
  unitTag: string;
  allowedSubjects: { code: string; name: string; slug: string }[];
}

const BUP_FACULTIES: FacultyConfig[] = [
  {
    unitCode: "UNI_ebd5fd78",
    itemSlug: "fass",
    itemName: "FASS (Faculty of Arts & Social Sciences)",
    itemDesc: "BUP Faculty of Arts & Social Sciences past admission test questions archive.",
    unitTag: "FASS",
    allowedSubjects: [
      { code: "SUB_22eb0d02", name: "ইংরেজি - গ্রামার ও ভোকাবুলারি", slug: "ইংরেজি-গ্রামার-ও-ভোকাবুলারি-sub_22eb0d02" },
      { code: "SUB_7a31a559", name: "সাধারন জ্ঞান - বাংলাদেশ", slug: "সাধারন-জ্ঞান-বাংলাদেশ-sub_7a31a559" },
      { code: "SUB_19679478", name: "সাধারন জ্ঞান - আন্তর্জাতিক", slug: "সাধারন-জ্ঞান-আন্তর্জাতিক-sub_19679478" },
      { code: "SUB_8a1edb7b", name: "বাংলা ব্যাকরন", slug: "বাংলা-ব্যাকরন-sub_8a1edb7b" },
      { code: "SUB_af941852", name: "বাংলা সাহিত্য", slug: "বাংলা-সাহিত্য-sub_af941852" },
      { code: "SUB_560e5122", name: "মানসিক দক্ষতা(IQ)", slug: "মানসিক-দক্ষতা-iq-sub_560e5122" },
      { code: "SUB_395b46c5", name: "তথ্য ও যোগাযোগ প্রযুক্তি", slug: "তথ্য-ও-যোগাযোগ-প্রযুক্তি-sub_395b46c5" }
    ]
  },
  {
    unitCode: "UNI_a1249f92",
    itemSlug: "fbs",
    itemName: "FBS (Faculty of Business Studies)",
    itemDesc: "BUP Faculty of Business Studies past admission test questions archive.",
    unitTag: "FBS",
    allowedSubjects: [
      { code: "SUB_22eb0d02", name: "ইংরেজি - গ্রামার ও ভোকাবুলারি", slug: "ইংরেজি-গ্রামার-ও-ভোকাবুলারি-sub_22eb0d02" },
      { code: "SUB_16342659", name: "সাধারণ গণিত", slug: "সাধারণ-গণিত-sub_16342659" },
      { code: "SUB_7a31a559", name: "সাধারন জ্ঞান - বাংলাদেশ", slug: "সাধারন-জ্ঞান-বাংলাদেশ-sub_7a31a559" },
      { code: "SUB_19679478", name: "সাধারন জ্ঞান - আন্তর্জাতিক", slug: "সাধারন-জ্ঞান-আন্তর্জাতিক-sub_19679478" },
      { code: "SUB_560e5122", name: "মানসিক দক্ষতা(IQ)", slug: "মানসিক-দক্ষতা-iq-sub_560e5122" },
      { code: "SUB_13b6cb76", name: "উচ্চতর গণিত দ্বিতীয় পত্র", slug: "উচ্চতর-গণিত-দ্বিতীয়-পত্র-sub_13b6cb76" },
      { code: "SUB_7f8e22c1", name: "উচ্চতর গণিত প্রথম পত্র", slug: "উচ্চতর-গণিত-প্রথম-পত্র-sub_7f8e22c1" }
    ]
  },
  {
    unitCode: "UNI_b7baf9bd",
    itemSlug: "fsss",
    itemName: "FSSS (Faculty of Security & Strategic Studies)",
    itemDesc: "BUP Faculty of Security & Strategic Studies past admission test questions archive.",
    unitTag: "FSSS",
    allowedSubjects: [
      { code: "SUB_22eb0d02", name: "ইংরেজি - গ্রামার ও ভোকাবুলারি", slug: "ইংরেজি-গ্রামার-ও-ভোকাবুলারি-sub_22eb0d02" },
      { code: "SUB_19679478", name: "সাধারন জ্ঞান - আন্তর্জাতিক", slug: "সাধারন-জ্ঞান-আন্তর্জাতিক-sub_19679478" },
      { code: "SUB_7a31a559", name: "সাধারন জ্ঞান - বাংলাদেশ", slug: "সাধারন-জ্ঞান-বাংলাদেশ-sub_7a31a559" },
      { code: "SUB_8a1edb7b", name: "বাংলা ব্যাকরন", slug: "বাংলা-ব্যাকরন-sub_8a1edb7b" },
      { code: "SUB_af941852", name: "বাংলা সাহিত্য", slug: "বাংলা-সাহিত্য-sub_af941852" },
      { code: "SUB_560e5122", name: "মানসিক দক্ষতা(IQ)", slug: "মানসিক-দক্ষতা-iq-sub_560e5122" }
    ]
  },
  {
    unitCode: "UNI_1db6915c",
    itemSlug: "fst",
    itemName: "FST (Faculty of Science & Technology)",
    itemDesc: "BUP Faculty of Science & Technology past admission test questions archive.",
    unitTag: "FST",
    allowedSubjects: [
      { code: "SUB_7f8e22c1", name: "উচ্চতর গণিত প্রথম পত্র", slug: "উচ্চতর-গণিত-প্রথম-পত্র-sub_7f8e22c1" },
      { code: "SUB_22eb0d02", name: "ইংরেজি - গ্রামার ও ভোকাবুলারি", slug: "ইংরেজি-গ্রামার-ও-ভোকাবুলারি-sub_22eb0d02" },
      { code: "SUB_57c463da", name: "রসায়ন দ্বিতীয় পত্র", slug: "রসায়ন-দ্বিতীয়-পত্র-sub_57c463da" },
      { code: "SUB_599bd423", name: "পদার্থবিজ্ঞান প্রথম পত্র", slug: "পদার্থবিজ্ঞান-প্রথম-পত্র-sub_599bd423" },
      { code: "SUB_2a8512fd", name: "পদার্থবিজ্ঞান দ্বিতীয় পত্র", slug: "পদার্থবিজ্ঞান-দ্বিতীয়-পত্র-sub_2a8512fd" },
      { code: "SUB_13b6cb76", name: "উচ্চতর গণিত দ্বিতীয় পত্র", slug: "উচ্চতর-গণিত-দ্বিতীয়-পত্র-sub_13b6cb76" },
      { code: "SUB_3d982a22", name: "জীববিজ্ঞান প্রথম পত্র", slug: "জীববিজ্ঞান-প্রথম-পত্র-sub_3d982a22" },
      { code: "SUB_2a4adee4", name: "রসায়ন প্রথম পত্র", slug: "রসায়ন-প্রথম-পত্র-sub_2a4adee4" },
      { code: "SUB_b7d3a5b7", name: "জীববিজ্ঞান দ্বিতীয় পত্র", slug: "জীববিজ্ঞান-দ্বিতীয়-পত্র-sub_b7d3a5b7" }
    ]
  }
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

function parseAndDeduplicateMetaTags(metaStr: string, unitTag: string) {
  const rawMatches = metaStr.match(/\[(.*?)\]/g) || [];
  const uniqueTags = new Set<string>();
  const parsedSources: { institution: string; unit: string; year?: number; raw: string }[] = [];

  for (const raw of rawMatches) {
    const clean = raw.replace(/[\[\]]/g, "").trim();
    if (uniqueTags.has(clean)) continue;
    uniqueTags.add(clean);

    const parts = clean.split(":").map((p) => p.trim());
    let institution = parts[0] || "BUP";
    let year: number | undefined;

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      const yNum = parseInt(part.replace(/\D/g, ""));
      if (!isNaN(yNum) && yNum > 1900 && yNum < 2100) {
        year = yNum;
      }
    }

    parsedSources.push({
      institution,
      unit: unitTag,
      year,
      raw: clean
    });
  }

  return parsedSources;
}

async function fetchQuestions(params: {
  subject: string;
  chapter?: string;
  topic?: string;
  unit: string;
  page: number;
}, retries = 3): Promise<{ questions: ScrapedQuestion[]; hasMore: boolean }> {
  const query = new URLSearchParams({
    university: UNIV_CODE,
    unit: params.unit,
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

async function importFaculty(
  client: any,
  db: any,
  faculty: FacultyConfig,
  target: any,
  container: any,
  orderIndex: number,
  sourceCache: Map<string, string>
) {
  console.log(`\n==================================================`);
  console.log(`Initializing Faculty: ${faculty.itemName} (${faculty.itemSlug})`);
  console.log(`==================================================`);

  const [containerItem] = await db
    .insert(qbContainerItems)
    .values({
      containerId: container.id,
      name: faculty.itemName,
      slug: faculty.itemSlug,
      description: faculty.itemDesc,
      orderIndex
    })
    .onConflictDoUpdate({
      target: [qbContainerItems.containerId, qbContainerItems.slug],
      set: { name: faculty.itemName, orderIndex }
    })
    .returning();

  const oldQ = await client`
    SELECT distinct q.id
    FROM qb_questions q
    JOIN qb_question_sources qs ON qs.question_id = q.id
    JOIN qb_sources s ON s.id = qs.source_id
    WHERE s.container_item_id = ${containerItem.id};
  `;

  if (oldQ.length > 0) {
    const oldIds = oldQ.map((r: any) => r.id);
    await client`DELETE FROM qb_question_sources WHERE question_id = ANY(${oldIds})`;
    await client`DELETE FROM qb_question_options WHERE question_id = ANY(${oldIds})`;
    await client`DELETE FROM qb_questions WHERE id = ANY(${oldIds})`;
  }

  await client`DELETE FROM qb_sources WHERE container_item_id = ${containerItem.id}`;

  const subjectMap = new Map<string, string>();
  const defaultTopicMap = new Map<string, string>();

  for (const cs of faculty.allowedSubjects) {
    let [dbSub] = await db.select().from(qbSubjects).where(eq(qbSubjects.code, cs.code));
    if (!dbSub) {
      [dbSub] = await db.select().from(qbSubjects).where(eq(qbSubjects.slug, cs.slug));
    }
    if (!dbSub) {
      [dbSub] = await db
        .insert(qbSubjects)
        .values({
          name: cs.name,
          slug: cs.slug,
          code: cs.code,
          targetId: target.id,
          level: "admission"
        })
        .returning();
    }
    subjectMap.set(cs.code, dbSub.id);

    let [defaultChapter] = await db.select().from(qbChapters).where(eq(qbChapters.slug, `bup-${faculty.itemSlug}-${cs.slug}-general`));
    if (!defaultChapter) {
      [defaultChapter] = await db
        .insert(qbChapters)
        .values({
          subjectId: dbSub.id,
          name: "সাধারণ অধ্যায়",
          slug: `bup-${faculty.itemSlug}-${cs.slug}-general`,
          containerItemId: containerItem.id
        })
        .returning();
    }

    let [defaultTopic] = await db.select().from(qbTopics).where(eq(qbTopics.slug, `bup-${faculty.itemSlug}-${cs.slug}-general-topic`));
    if (!defaultTopic) {
      [defaultTopic] = await db
        .insert(qbTopics)
        .values({
          chapterId: defaultChapter.id,
          name: "সাধারণ টপিক",
          slug: `bup-${faculty.itemSlug}-${cs.slug}-general-topic`
        })
        .returning();
    }
    defaultTopicMap.set(cs.code, defaultTopic.id);
  }

  const dbChapters = await db.select().from(qbChapters);
  const dbTopics = await db.select().from(qbTopics);

  const chapterMap = new Map<string, string>();
  dbChapters.forEach((c: any) => {
    chapterMap.set(`${c.subjectId}:${c.name}`, c.id);
    chapterMap.set(`${c.subjectId}:${c.slug}`, c.id);
  });

  const topicMap = new Map<string, string>();
  dbTopics.forEach((t: any) => {
    topicMap.set(`${t.chapterId}:${t.name}`, t.id);
    topicMap.set(`${t.chapterId}:${t.slug}`, t.id);
    topicMap.set(t.slug, t.id);
  });

  console.log(`Discovering all chapters and topics for ${faculty.itemName}...`);
  const topicTasks: TopicTask[] = [];

  for (const cs of faculty.allowedSubjects) {
    const subDbId = subjectMap.get(cs.code)!;
    const chapUrl = `${AJAX_URL}?ajax=1&step=chapters&university=${UNIV_CODE}&unit=${faculty.unitCode}&subject=${cs.code}`;
    let chapData: any = {};
    try {
      const res = await fetch(chapUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
      chapData = await res.json();
    } catch {}

    const $c = cheerio.load(chapData.html || "");
    const chapList: { code: string; name: string }[] = [];

    $c("[onclick*='toggleChapter']").each((_, el) => {
      const onclick = $c(el).attr("onclick") || "";
      const matchChap = onclick.match(/toggleChapter\('[^']+',\s*'[^']+',\s*'([^']+)'/);
      if (matchChap && !chapList.some((c) => c.code === matchChap[1])) {
        const rawName = $c(el).find("span.font-semibold").text().trim() || $c(el).text().replace(/\d+\s*Q.*$/, "").trim();
        chapList.push({ code: matchChap[1], name: rawName });
      }
    });

    for (const ch of chapList) {
      const chapCode = ch.code;
      const rawChapName = ch.name;
      const chapSlug = `bup-${faculty.itemSlug}-${cs.slug}-${chapCode.toLowerCase()}`;
      let chapDbId = chapterMap.get(`${subDbId}:${rawChapName}`) || chapterMap.get(`${subDbId}:${chapSlug}`);

      if (!chapDbId) {
        const [newCh] = await db
          .insert(qbChapters)
          .values({
            subjectId: subDbId,
            name: rawChapName,
            slug: chapSlug,
            containerItemId: containerItem.id
          })
          .returning();
        chapDbId = newCh.id;
        chapterMap.set(`${subDbId}:${rawChapName}`, chapDbId);
        chapterMap.set(`${subDbId}:${chapSlug}`, chapDbId);
      }

      const topUrl = `${AJAX_URL}?ajax=1&step=topics&university=${UNIV_CODE}&unit=${faculty.unitCode}&subject=${cs.code}&chapter=${chapCode}`;
      let topData: any = {};
      try {
        const res = await fetch(topUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
        topData = await res.json();
      } catch {}

      const $t = cheerio.load(topData.html || "");
      const topList: { code: string; name: string }[] = [];

      $t("div.flex.justify-between").each((_, el) => {
        const btn = $t(el).find("button[onclick*='openQbModal']");
        const onclick = btn.attr("onclick") || $t(el).find("a").attr("onclick") || "";
        const matchTop = onclick.match(/topic=([^&'"\)]+)/);
        if (matchTop && !topList.some((t) => t.code === matchTop[1])) {
          let rawTopName = $t(el).find("span.truncate").text().trim() || $t(el).find("span").first().text().trim();
          if (!rawTopName || rawTopName.toLowerCase().includes("view") || rawTopName.toLowerCase().includes("question")) {
            rawTopName = `${rawChapName} - Topic ${matchTop[1].replace("TOP_", "")}`;
          }
          topList.push({
            code: matchTop[1],
            name: rawTopName
          });
        }
      });

      if (topList.length === 0) {
        topList.push({ code: "", name: rawChapName });
      }

      for (const top of topList) {
        const topCode = top.code;
        const topName = top.name;
        const topSlug = `${chapSlug}-${topCode ? topCode.toLowerCase() : "all"}`;
        let topDbId = topicMap.get(`${chapDbId}:${topName}`) || topicMap.get(`${chapDbId}:${topSlug}`) || topicMap.get(topSlug);

        if (!topDbId) {
          const [newTop] = await db
            .insert(qbTopics)
            .values({
              chapterId: chapDbId,
              name: topName,
              slug: topSlug
            })
            .returning();
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
  }

  console.log(`Discovered ${topicTasks.length} topics for ${faculty.itemName}. Starting ingestion...`);

  const seenQuestions = new Set<string>();
  let totalImportedQuestions = 0;
  let totalSourcesLinked = 0;
  const workerCount = 10;
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
          topic: task.topicCode || undefined,
          unit: faculty.unitCode,
          page
        });

        if (result.questions.length === 0) break;

        for (const q of result.questions) {
          const qKey = normalizeKey(q.questionText);
          if (seenQuestions.has(qKey)) continue;
          seenQuestions.add(qKey);

          try {
            const [qRow] = await db
              .insert(qbQuestions)
              .values({
                topicId: task.dbTopicId,
                qType: "mcq",
                questionText: q.questionText,
                status: "published",
                orderIndex: parseInt(q.number) || 0
              })
              .returning({ id: qbQuestions.id });

            totalImportedQuestions++;

            for (let i = 0; i < q.options.length; i++) {
              const opt = q.options[i];
              await db.insert(qbQuestionOptions).values({
                questionId: qRow.id,
                optionText: opt.text || opt.label || `Option ${i + 1}`,
                isCorrect: opt.isCorrect,
                orderIndex: i
              });
            }

            const metaList = parseAndDeduplicateMetaTags(q.meta, faculty.unitTag);
            const effectiveMetaList =
              metaList.length > 0
                ? metaList
                : [{ institution: "BUP", unit: faculty.unitTag, year: undefined, raw: `BUP ${faculty.unitTag}` }];

            for (const meta of effectiveMetaList) {
              const sSlug = `bup-${faculty.itemSlug}-${meta.raw.toLowerCase().replace(/[^a-z0-9\u0980-\u09ff]+/g, "-").replace(/(^-|-$)/g, "")}`;
              let sourceId = sourceCache.get(sSlug);
              if (!sourceId) {
                const [srcRow] = await db
                  .insert(qbSources)
                  .values({
                    containerId: container.id,
                    containerItemId: containerItem.id,
                    sourceGroup: "admission",
                    type: "university",
                    name: `BUP ${meta.raw}`,
                    slug: sSlug,
                    institution: "BUP",
                    unit: meta.unit,
                    year: meta.year || null,
                    questionCount: 0
                  })
                  .onConflictDoUpdate({
                    target: qbSources.slug,
                    set: { name: `BUP ${meta.raw}` }
                  })
                  .returning({ id: qbSources.id });
                sourceId = srcRow.id;
                sourceCache.set(sSlug, sourceId);
              }

              await db
                .insert(qbQuestionSources)
                .values({
                  questionId: qRow.id,
                  sourceId: sourceId
                })
                .onConflictDoNothing();

              totalSourcesLinked++;
            }
          } catch (err) {}
        }

        hasMore = result.hasMore;
        page++;
      }
    }
  }

  const topicWorkers = Array.from({ length: workerCount }, () => topicWorker());
  await Promise.all(topicWorkers);

  console.log(`Pass 1 done for ${faculty.itemName}: ${totalImportedQuestions} Qs. Starting Pass 2 (Subject Sweep)...`);

  for (const cs of faculty.allowedSubjects) {
    const fallbackTopicId = defaultTopicMap.get(cs.code)!;
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const result = await fetchQuestions({
        subject: cs.code,
        unit: faculty.unitCode,
        page
      });

      if (result.questions.length === 0) break;

      for (const q of result.questions) {
        const qKey = normalizeKey(q.questionText);
        if (seenQuestions.has(qKey)) continue;
        seenQuestions.add(qKey);

        try {
          const [qRow] = await db
            .insert(qbQuestions)
            .values({
              topicId: fallbackTopicId,
              qType: "mcq",
              questionText: q.questionText,
              status: "published",
              orderIndex: parseInt(q.number) || 0
            })
            .returning({ id: qbQuestions.id });

          totalImportedQuestions++;

          for (let i = 0; i < q.options.length; i++) {
            const opt = q.options[i];
            await db.insert(qbQuestionOptions).values({
              questionId: qRow.id,
              optionText: opt.text || opt.label || `Option ${i + 1}`,
              isCorrect: opt.isCorrect,
              orderIndex: i
            });
          }

          const metaList = parseAndDeduplicateMetaTags(q.meta, faculty.unitTag);
          const effectiveMetaList =
            metaList.length > 0
              ? metaList
              : [{ institution: "BUP", unit: faculty.unitTag, year: undefined, raw: `BUP ${faculty.unitTag}` }];

          for (const meta of effectiveMetaList) {
            const sSlug = `bup-${faculty.itemSlug}-${meta.raw.toLowerCase().replace(/[^a-z0-9\u0980-\u09ff]+/g, "-").replace(/(^-|-$)/g, "")}`;
            let sourceId = sourceCache.get(sSlug);
            if (!sourceId) {
              const [srcRow] = await db
                .insert(qbSources)
                .values({
                  containerId: container.id,
                  containerItemId: containerItem.id,
                  sourceGroup: "admission",
                  type: "university",
                  name: `BUP ${meta.raw}`,
                  slug: sSlug,
                  institution: "BUP",
                  unit: meta.unit,
                  year: meta.year || null,
                  questionCount: 0
                })
                .onConflictDoUpdate({
                  target: qbSources.slug,
                  set: { name: `BUP ${meta.raw}` }
                })
                .returning({ id: qbSources.id });
              sourceId = srcRow.id;
              sourceCache.set(sSlug, sourceId);
            }

            await db
              .insert(qbQuestionSources)
              .values({
                questionId: qRow.id,
                sourceId: sourceId
              })
              .onConflictDoNothing();

            totalSourcesLinked++;
          }
        } catch (err) {}
      }

      hasMore = result.hasMore;
      page++;
    }
  }

  console.log(`Finished ${faculty.itemName}: Total Imported = ${totalImportedQuestions}, Sources Linked = ${totalSourcesLinked}`);
}

async function main() {
  const connectionString = "postgresql://paws:df8f13a4@127.0.0.1:5432/paws";
  const client = postgres(connectionString);
  const db = drizzle(client);

  try {
    const [target] = await db
      .insert(qbTargets)
      .values({
        name: "Varsity Admission",
        slug: "varsity-admission",
        group: "admission"
      })
      .onConflictDoUpdate({
        target: qbTargets.slug,
        set: { name: "Varsity Admission" }
      })
      .returning();

    const [container] = await db
      .insert(qbContainers)
      .values({
        targetId: target.id,
        name: "BUP Question Bank",
        slug: "bup-question-bank",
        description: "Bangladesh University of Professionals past admission test question archive",
        orderIndex: 6
      })
      .onConflictDoUpdate({
        target: [qbContainers.targetId, qbContainers.slug],
        set: { name: "BUP Question Bank", orderIndex: 6 }
      })
      .returning();

    const sourceCache = new Map<string, string>();

    for (let fIdx = 0; fIdx < BUP_FACULTIES.length; fIdx++) {
      const faculty = BUP_FACULTIES[fIdx];
      await importFaculty(client, db, faculty, target, container, fIdx + 1, sourceCache);
    }

    console.log("\nRecalculating all question counts across database hierarchy...");
    await recalculateAllCounts(db);
    console.log("All counts synchronized successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await client.end();
  }
}

main();
