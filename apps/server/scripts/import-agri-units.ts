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

interface AgriItemConfig {
  univCode: string;
  containerSlug: string;
  containerName: string;
  containerDesc: string;
  containerOrderIndex: number;
  itemSlug: string;
  itemName: string;
  itemDesc: string;
  itemOrderIndex: number;
  institutionTag: string;
}

const AGRI_ITEMS: AgriItemConfig[] = [
  {
    univCode: "UNI_F81PT6",
    containerSlug: "agri-question-bank",
    containerName: "Agricultural Universities Question Bank",
    containerDesc: "Agricultural Universities Cluster (কৃষি গুচ্ছ) and Individual Agricultural Universities Archive",
    containerOrderIndex: 1,
    itemSlug: "cluster",
    itemName: "Agricultural Cluster (কৃষি গুচ্ছ সমন্বিত ভর্তি পরীক্ষা)",
    itemDesc: "Combined Agricultural Universities Admission Test Question Archive",
    itemOrderIndex: 1,
    institutionTag: "Agri-Cluster"
  },
  {
    univCode: "UNI_NSIJSK",
    containerSlug: "agri-question-bank",
    containerName: "Agricultural Universities Question Bank",
    containerDesc: "Agricultural Universities Cluster (কৃষি গুচ্ছ) and Individual Agricultural Universities Archive",
    containerOrderIndex: 1,
    itemSlug: "bau",
    itemName: "BAU Admission Test (বাংলাদেশ কৃষি বিশ্ববিদ্যালয় - বাকৃবি)",
    itemDesc: "Bangladesh Agricultural University (Mymensingh) past admission archive",
    itemOrderIndex: 2,
    institutionTag: "BAU"
  },
  {
    univCode: "UNI_43OA21",
    containerSlug: "agri-question-bank",
    containerName: "Agricultural Universities Question Bank",
    containerDesc: "Agricultural Universities Cluster (কৃষি গুচ্ছ) and Individual Agricultural Universities Archive",
    containerOrderIndex: 1,
    itemSlug: "sau",
    itemName: "SAU Admission Test (শেরেবাংলা কৃষি বিশ্ববিদ্যালয় - শেকৃবি)",
    itemDesc: "Sher-e-Bangla Agricultural University (Dhaka) past admission archive",
    itemOrderIndex: 3,
    institutionTag: "SAU"
  },
  {
    univCode: "UNI_D9GCAY",
    containerSlug: "agri-question-bank",
    containerName: "Agricultural Universities Question Bank",
    containerDesc: "Agricultural Universities Cluster (কৃষি গুচ্ছ) and Individual Agricultural Universities Archive",
    containerOrderIndex: 1,
    itemSlug: "sylhet-sau",
    itemName: "Sylhet SAU Admission Test (সিলেট কৃষি বিশ্ববিদ্যালয় - সিকৃবি)",
    itemDesc: "Sylhet Agricultural University past admission archive",
    itemOrderIndex: 4,
    institutionTag: "Sylhet-SAU"
  },
  {
    univCode: "UNI_eb22eb32",
    containerSlug: "agri-question-bank",
    containerName: "Agricultural Universities Question Bank",
    containerDesc: "Agricultural Universities Cluster (কৃষি গুচ্ছ) and Individual Agricultural Universities Archive",
    containerOrderIndex: 1,
    itemSlug: "bsmrau",
    itemName: "BSMRAU Admission Test (বঙ্গবন্ধু শেখ মুজিবুর রহমান কৃষি বিশ্ববিদ্যালয়)",
    itemDesc: "Bangabandhu Sheikh Mujibur Rahman Agricultural University (Gazipur) admission archive",
    itemOrderIndex: 5,
    institutionTag: "BSMRAU"
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

function parseAndDeduplicateMetaTags(metaStr: string, instTag: string) {
  const rawMatches = metaStr.match(/\[(.*?)\]/g) || [];
  const uniqueTags = new Set<string>();
  const parsedSources: { institution: string; unit?: string; year?: number; raw: string }[] = [];

  for (const raw of rawMatches) {
    const clean = raw.replace(/[\[\]]/g, "").trim();
    if (uniqueTags.has(clean)) continue;
    uniqueTags.add(clean);

    const parts = clean.split(":").map((p) => p.trim());
    let institution = parts[0] || instTag;
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
      year,
      raw: clean
    });
  }

  return parsedSources;
}

async function fetchQuestions(
  params: {
    univCode: string;
    subject: string;
    chapter?: string;
    topic?: string;
    page: number;
  },
  retries = 3
): Promise<{ questions: ScrapedQuestion[]; hasMore: boolean }> {
  const query = new URLSearchParams({
    university: params.univCode,
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
          questions.push({
            dbId,
            number,
            questionText,
            meta,
            options
          });
        }
      });

      return {
        questions,
        hasMore: data.has_more ?? false
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

async function fetchSubjects(univCode: string) {
  const query = new URLSearchParams({
    ajax: "1",
    step: "year",
    family: "University",
    university: univCode
  });

  try {
    const res = await fetch(`${AJAX_URL}?${query.toString()}`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    });
    const data = await res.json();
    const $ = cheerio.load(data.html || "");
    const subjects: { code: string; name: string }[] = [];

    $("#tab-content-subject .flex.justify-between").each((_, el) => {
      const name = $(el).find(".font-bold").first().text().trim();
      const onclick = $(el).attr("onclick") || "";
      const match = onclick.match(/SUB_[a-zA-Z0-9]+/);
      if (match && name) {
        subjects.push({ code: match[0], name });
      }
    });

    return subjects;
  } catch (e) {
    return [];
  }
}

async function fetchChapters(univCode: string, subjectCode: string) {
  const query = new URLSearchParams({
    ajax: "1",
    step: "chapters",
    university: univCode,
    subject: subjectCode
  });

  try {
    const res = await fetch(`${AJAX_URL}?${query.toString()}`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    });
    const data = await res.json();
    const $ = cheerio.load(data.html || "");
    const chapters: { code: string; name: string }[] = [];

    $("[onclick*=\"toggleChapter\"]").each((_, el) => {
      const onclick = $(el).attr("onclick") || "";
      const match = onclick.match(/toggleChapter\('[^']+',\s*'[^']+',\s*'([^']+)'/);
      if (match) {
        const cCode = match[1];
        const cName = $(el).find(".font-semibold").first().text().trim() || $(el).find(".font-bold").first().text().trim();
        if (cCode && cName && !chapters.some(c => c.code === cCode)) {
          chapters.push({ code: cCode, name: cName });
        }
      }
    });

    return chapters;
  } catch (e) {
    return [];
  }
}

async function fetchTopics(univCode: string, subjectCode: string, chapterCode: string) {
  const query = new URLSearchParams({
    ajax: "1",
    step: "topics",
    university: univCode,
    subject: subjectCode,
    chapter: chapterCode
  });

  try {
    const res = await fetch(`${AJAX_URL}?${query.toString()}`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    });
    const data = await res.json();
    const $ = cheerio.load(data.html || "");
    const topics: { code: string; name: string }[] = [];

    $("div.flex.justify-between").each((_, el) => {
      const btn = $(el).find("button[onclick*=\"openQbModal\"]");
      const onclick = btn.attr("onclick") || $(el).find("a").attr("onclick") || "";
      const matchTop = onclick.match(/topic=([^&'"\)]+)/);
      if (matchTop) {
        const tCode = matchTop[1];
        let tName = $(el).find("span.truncate").text().trim() || $(el).find("span").first().text().trim();
        if (tCode && !topics.some(t => t.code === tCode)) {
          topics.push({ code: tCode, name: tName });
        }
      }
    });

    return topics;
  } catch (e) {
    return [];
  }
}

async function importAgriItem(
  client: any,
  db: any,
  cfg: AgriItemConfig,
  target: any,
  container: any,
  sourceCache: Map<string, string>
) {
  console.log(`\n==================================================`);
  console.log(`Initializing: ${cfg.itemName} (${cfg.containerSlug} -> ${cfg.itemSlug})`);
  console.log(`==================================================`);

  const [containerItem] = await db
    .insert(qbContainerItems)
    .values({
      containerId: container.id,
      name: cfg.itemName,
      slug: cfg.itemSlug,
      description: cfg.itemDesc,
      orderIndex: cfg.itemOrderIndex
    })
    .onConflictDoUpdate({
      target: [qbContainerItems.containerId, qbContainerItems.slug],
      set: {
        name: cfg.itemName,
        description: cfg.itemDesc,
        orderIndex: cfg.itemOrderIndex
      }
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

  const subjectsList = await fetchSubjects(cfg.univCode);
  console.log(`Discovered ${subjectsList.length} subjects for ${cfg.itemName}.`);

  const subjectMap = new Map<string, string>();
  const defaultTopicMap = new Map<string, string>();

  for (let sIdx = 0; sIdx < subjectsList.length; sIdx++) {
    const cs = subjectsList[sIdx];
    const sSlug = `${cs.name.toLowerCase().replace(/[^a-z0-9\u0980-\u09ff]+/g, "-")}-${cs.code.toLowerCase()}`;

    let [dbSub] = await db.select().from(qbSubjects).where(eq(qbSubjects.code, cs.code));
    if (!dbSub) {
      [dbSub] = await db.select().from(qbSubjects).where(eq(qbSubjects.slug, sSlug));
    }
    if (!dbSub) {
      [dbSub] = await db
        .insert(qbSubjects)
        .values({
          name: cs.name,
          slug: sSlug,
          code: cs.code,
          targetId: target.id,
          level: "admission"
        })
        .returning();
    }
    subjectMap.set(cs.code, dbSub.id);

    const defChapSlug = `agri-${cfg.containerSlug}-${cfg.itemSlug}-${cs.code.toLowerCase()}-gen`;
    let [defaultChapter] = await db.select().from(qbChapters).where(eq(qbChapters.slug, defChapSlug));
    if (!defaultChapter) {
      [defaultChapter] = await db
        .insert(qbChapters)
        .values({
          subjectId: dbSub.id,
          name: "সাধারণ অধ্যায়",
          slug: defChapSlug,
          containerItemId: containerItem.id
        })
        .returning();
    }

    const defTopSlug = `${defChapSlug}-topic`;
    let [defaultTopic] = await db.select().from(qbTopics).where(eq(qbTopics.slug, defTopSlug));
    if (!defaultTopic) {
      [defaultTopic] = await db
        .insert(qbTopics)
        .values({
          chapterId: defaultChapter.id,
          name: "সাধারণ টপিক",
          slug: defTopSlug
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

  console.log(`Discovering all chapters and topics for ${cfg.itemName}...`);
  const topicTasks: TopicTask[] = [];

  for (const cs of subjectsList) {
    const subDbId = subjectMap.get(cs.code)!;
    const chapters = await fetchChapters(cfg.univCode, cs.code);

    for (const ch of chapters) {
      const chapSlug = `agri-${cfg.containerSlug}-${cfg.itemSlug}-${cs.code.toLowerCase()}-${ch.code.toLowerCase()}`;
      let chapDbId = chapterMap.get(`${subDbId}:${ch.name}`) || chapterMap.get(`${subDbId}:${chapSlug}`);

      if (!chapDbId) {
        const [newCh] = await db
          .insert(qbChapters)
          .values({
            subjectId: subDbId,
            name: ch.name,
            slug: chapSlug,
            containerItemId: containerItem.id
          })
          .returning();
        chapDbId = newCh.id;
        chapterMap.set(`${subDbId}:${ch.name}`, chapDbId);
        chapterMap.set(`${subDbId}:${chapSlug}`, chapDbId);
      }

      const topics = await fetchTopics(cfg.univCode, cs.code, ch.code);
      if (topics.length === 0) {
        topics.push({ code: "", name: ch.name });
      }

      for (const top of topics) {
        const topSlug = `${chapSlug}-${top.code ? top.code.toLowerCase() : "all"}`;
        let topDbId = topicMap.get(`${chapDbId}:${top.name}`) || topicMap.get(`${chapDbId}:${topSlug}`) || topicMap.get(topSlug);

        if (!topDbId) {
          const [newTop] = await db
            .insert(qbTopics)
            .values({
              chapterId: chapDbId,
              name: top.name,
              slug: topSlug
            })
            .returning();
          topDbId = newTop.id;
          topicMap.set(`${chapDbId}:${top.name}`, topDbId);
          topicMap.set(`${chapDbId}:${topSlug}`, topDbId);
          topicMap.set(topSlug, topDbId);
        }

        topicTasks.push({
          subjectCode: cs.code,
          subjectName: cs.name,
          chapterCode: ch.code,
          chapterName: ch.name,
          topicCode: top.code,
          topicName: top.name,
          dbTopicId: topDbId
        });
      }
    }
  }

  console.log(`Discovered ${topicTasks.length} topics for ${cfg.itemName}. Starting ingestion...`);

  let totalImportedQuestions = 0;
  let totalSourcesLinked = 0;
  const seenQuestions = new Set<string>();

  const workerCount = 12;
  let taskIndex = 0;

  async function topicWorker() {
    while (true) {
      const idx = taskIndex++;
      if (idx >= topicTasks.length) break;
      const task = topicTasks[idx];

      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const result = await fetchQuestions({
          univCode: cfg.univCode,
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

            const metaList = parseAndDeduplicateMetaTags(q.meta, cfg.institutionTag);
            const effectiveMetaList =
              metaList.length > 0
                ? metaList
                : [{ institution: cfg.institutionTag, year: undefined, raw: `${cfg.institutionTag} Admission` }];

            for (const meta of effectiveMetaList) {
              const sSlug = `agri-${cfg.containerSlug}-${cfg.itemSlug}-${meta.raw.toLowerCase().replace(/[^a-z0-9\u0980-\u09ff]+/g, "-").replace(/(^-|-$)/g, "")}`;
              let sourceId = sourceCache.get(sSlug);
              if (!sourceId) {
                const [srcRow] = await db
                  .insert(qbSources)
                  .values({
                    containerId: container.id,
                    containerItemId: containerItem.id,
                    sourceGroup: "admission",
                    type: "university",
                    name: `${cfg.institutionTag} ${meta.raw}`,
                    slug: sSlug,
                    institution: meta.institution || cfg.institutionTag,
                    year: meta.year || null,
                    questionCount: 0
                  })
                  .onConflictDoUpdate({
                    target: qbSources.slug,
                    set: { name: `${cfg.institutionTag} ${meta.raw}` }
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

  console.log(`Pass 1 done for ${cfg.itemName}: ${totalImportedQuestions} Qs. Starting Pass 2 (Subject Sweep)...`);

  for (const cs of subjectsList) {
    const fallbackTopicId = defaultTopicMap.get(cs.code)!;
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const result = await fetchQuestions({
        univCode: cfg.univCode,
        subject: cs.code,
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

          const metaList = parseAndDeduplicateMetaTags(q.meta, cfg.institutionTag);
          const effectiveMetaList =
            metaList.length > 0
              ? metaList
              : [{ institution: cfg.institutionTag, year: undefined, raw: `${cfg.institutionTag} Admission` }];

          for (const meta of effectiveMetaList) {
            const sSlug = `agri-${cfg.containerSlug}-${cfg.itemSlug}-${meta.raw.toLowerCase().replace(/[^a-z0-9\u0980-\u09ff]+/g, "-").replace(/(^-|-$)/g, "")}`;
            let sourceId = sourceCache.get(sSlug);
            if (!sourceId) {
              const [srcRow] = await db
                .insert(qbSources)
                .values({
                  containerId: container.id,
                  containerItemId: containerItem.id,
                  sourceGroup: "admission",
                  type: "university",
                  name: `${cfg.institutionTag} ${meta.raw}`,
                  slug: sSlug,
                  institution: meta.institution || cfg.institutionTag,
                  year: meta.year || null,
                  questionCount: 0
                })
                .onConflictDoUpdate({
                  target: qbSources.slug,
                  set: { name: `${cfg.institutionTag} ${meta.raw}` }
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

  console.log(`Finished ${cfg.itemName}: Total Imported = ${totalImportedQuestions}, Sources Linked = ${totalSourcesLinked}`);
}

async function main() {
  const connectionString = "postgresql://paws:df8f13a4@127.0.0.1:5432/paws";
  const client = postgres(connectionString);
  const db = drizzle(client);

  try {
    const [target] = await db
      .insert(qbTargets)
      .values({
        name: "Agricultural Admission",
        slug: "agri-admission",
        group: "admission"
      })
      .onConflictDoUpdate({
        target: qbTargets.slug,
        set: { name: "Agricultural Admission" }
      })
      .returning();

    const containerCache = new Map<string, any>();
    const sourceCache = new Map<string, string>();

    for (const item of AGRI_ITEMS) {
      let container = containerCache.get(item.containerSlug);
      if (!container) {
        const [cRow] = await db
          .insert(qbContainers)
          .values({
            targetId: target.id,
            name: item.containerName,
            slug: item.containerSlug,
            description: item.containerDesc,
            orderIndex: item.containerOrderIndex
          })
          .onConflictDoUpdate({
            target: [qbContainers.targetId, qbContainers.slug],
            set: { name: item.containerName, orderIndex: item.containerOrderIndex }
          })
          .returning();
        container = cRow;
        containerCache.set(item.containerSlug, container);
      }

      await importAgriItem(client, db, item, target, container, sourceCache);
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
