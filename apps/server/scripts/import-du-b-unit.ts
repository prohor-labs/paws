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
import { eq, and, sql } from "drizzle-orm";

const BASE_URL = "https://studyclubd.com/view-question1/";
const AJAX_URL = "https://studyclubd.com/qb-archive/includes/ajax.php";
const UNIV_CODE = "UNI_J32I8G";
const UNIT_CODE = "UNI_f20da169";

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

interface ScrapingTask {
  subjectCode: string;
  subjectName: string;
  chapterCode: string;
  chapterName: string;
  topicCode: string;
  topicName: string;
  dbTopicId: string | null;
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
    parsedSources.push({
      institution: parts[0] || "DU",
      unit: parts[1] || "Unit-B",
      year: parts[2] ? parseInt(parts[2].replace(/\D/g, "")) : undefined
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
      await new Promise(res => setTimeout(res, 300 * (r + 1)));
    }
  }

  return { questions: [], hasMore: false };
}

async function main() {
  console.log("Initializing database connection...");
  const dbUrl = process.env.DATABASE_URL || "postgresql://paws:df8f13a4@127.0.0.1:5432/paws";
  const client = postgres(dbUrl, { max: 20 });
  const db = drizzle(client);

  const [target] = await db.insert(qbTargets).values({
    group: "admission",
    name: "Dhaka University",
    slug: "dhaka-university",
    orderIndex: 1
  }).onConflictDoUpdate({
    target: qbTargets.slug,
    set: { name: "Dhaka University" }
  }).returning();

  const [container] = await db.insert(qbContainers).values({
    targetId: target.id,
    name: "Dhaka University Question Bank",
    slug: "du-question-bank",
    description: "Dhaka University past admission test question bank",
    orderIndex: 1
  }).onConflictDoUpdate({
    target: [qbContainers.targetId, qbContainers.slug],
    set: { name: "Dhaka University Question Bank" }
  }).returning();

  const [containerItem] = await db.insert(qbContainerItems).values({
    containerId: container.id,
    name: "B Unit (কলা, আইন ও সামাজিক বিজ্ঞান অনুষদ)",
    slug: "b-unit",
    description: "DU B Unit Admission Question Archive",
    orderIndex: 2
  }).onConflictDoUpdate({
    target: [qbContainerItems.containerId, qbContainerItems.slug],
    set: { name: "B Unit (কলা, আইন ও সামাজিক বিজ্ঞান অনুষদ)" }
  }).returning();

  console.log("Loading taxonomy lookup...");
  const dbSubjects = await db.select().from(qbSubjects);
  const dbChapters = await db.select().from(qbChapters);
  const dbTopics = await db.select().from(qbTopics);

  const subjectMap = new Map<string, string>();
  dbSubjects.forEach(s => {
    if (s.code) subjectMap.set(s.code, s.id);
    subjectMap.set(s.name, s.id);
    subjectMap.set(s.slug, s.id);
  });

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

  console.log("Discovering DU B Unit hierarchy concurrently...");
  const yearRes = await fetch(`${AJAX_URL}?ajax=1&step=year&family=University&university=${UNIV_CODE}&unit=${UNIT_CODE}`, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
  });
  const yearData = await yearRes.json();
  const $y = cheerio.load(yearData.html || "");

  const subjList: { code: string; name: string }[] = [];
  $y("#tab-content-subject .bg-white").each((_, el) => {
    const card = $y(el);
    const header = card.find(".flex.justify-between").first();
    const onclick = header.attr("onclick") || "";
    const matchSub = onclick.match(/SUB_[a-zA-Z0-9]+/);
    if (matchSub) {
      subjList.push({
        code: matchSub[0],
        name: header.find("span.font-bold").first().text().trim()
      });
    }
  });

  console.log(`Discovered ${subjList.length} subjects. Concurrently fetching chapters and topics...`);

  for (const s of subjList) {
    const subjSlug = s.code.toLowerCase().replace(/_/g, "-");
    let subDbId = subjectMap.get(s.code) || subjectMap.get(s.name) || subjectMap.get(subjSlug);
    if (!subDbId) {
      const [newSub] = await db.insert(qbSubjects).values({
        name: s.name,
        slug: subjSlug,
        code: s.code,
        targetId: target.id,
        level: "admission"
      }).onConflictDoUpdate({
        target: qbSubjects.slug,
        set: { name: s.name }
      }).returning({ id: qbSubjects.id });
      subDbId = newSub.id;
      subjectMap.set(s.code, subDbId);
      subjectMap.set(s.name, subDbId);
      subjectMap.set(subjSlug, subDbId);
    }
  }

  const tasks: ScrapingTask[] = [];

  await Promise.all(subjList.map(async (subj) => {
    const subCode = subj.code;
    const rawSubjName = subj.name;
    const subDbId = subjectMap.get(subCode)!;

    const chapRes = await fetch(`${AJAX_URL}?ajax=1&step=chapters&university=${UNIV_CODE}&unit=${UNIT_CODE}&subject=${subCode}`, {
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

      const topRes = await fetch(`${AJAX_URL}?ajax=1&step=topics&university=${UNIV_CODE}&unit=${UNIT_CODE}&subject=${subCode}&chapter=${chapCode}`, {
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

          tasks.push({
            subjectCode: subCode,
            subjectName: rawSubjName,
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

  console.log(`Discovered ${tasks.length} specific topic queues. Scraping questions with 10 workers...`);

  let totalImportedQuestions = 0;
  let totalImportedOptions = 0;
  let totalSourcesLinked = 0;
  let completedTasks = 0;

  const sourceCache = new Map<string, string>();
  const workerCount = 10;
  let taskIndex = 0;

  async function worker() {
    while (taskIndex < tasks.length) {
      const currentTask = tasks[taskIndex++];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const result = await fetchQuestions({
          subject: currentTask.subjectCode,
          chapter: currentTask.chapterCode,
          topic: currentTask.topicCode,
          page
        });

        if (result.questions.length === 0) break;

        for (const q of result.questions) {
          try {
            const [qRow] = await db.insert(qbQuestions).values({
              topicId: currentTask.dbTopicId,
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
            for (const meta of metaList) {
              const sSlug = `${meta.institution}-${meta.unit || "unit-b"}-${meta.year || "all"}`.toLowerCase().replace(/[^\w-]/g, "-");
              
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

      completedTasks++;
      if (completedTasks % 20 === 0 || completedTasks === tasks.length) {
        console.log(`[PROGRESS] [${completedTasks}/${tasks.length} Topics] Questions: ${totalImportedQuestions} | Options: ${totalImportedOptions} | Sources: ${totalSourcesLinked}`);
      }
    }
  }

  const workers = Array.from({ length: workerCount }, () => worker());
  await Promise.all(workers);

  const containerItemCountRes = await db.select({
    count: sql<number>`count(distinct ${qbQuestionSources.questionId})`
  }).from(qbQuestionSources)
    .innerJoin(qbSources, eq(qbQuestionSources.sourceId, qbSources.id))
    .where(eq(qbSources.containerItemId, containerItem.id));
  
  const bUnitQuestionCount = Number(containerItemCountRes[0]?.count || totalImportedQuestions);

  await db.update(qbContainerItems).set({
    questionCount: bUnitQuestionCount
  }).where(eq(qbContainerItems.id, containerItem.id));

  const totalContainerCountRes = await db.select({
    count: sql<number>`count(distinct ${qbQuestionSources.questionId})`
  }).from(qbQuestionSources)
    .innerJoin(qbSources, eq(qbQuestionSources.sourceId, qbSources.id))
    .where(eq(qbSources.containerId, container.id));

  const totalContainerQuestions = Number(totalContainerCountRes[0]?.count || 0);

  const allItemsCountRes = await db.select({
    count: sql<number>`count(*)`
  }).from(qbContainerItems)
    .where(eq(qbContainerItems.containerId, container.id));

  await db.update(qbContainers).set({
    questionCount: totalContainerQuestions,
    itemCount: Number(allItemsCountRes[0]?.count || 2)
  }).where(eq(qbContainers.id, container.id));

  await db.update(qbTargets).set({
    questionCount: totalContainerQuestions
  }).where(eq(qbTargets.id, target.id));

  console.log(`\nImport completed: ${totalImportedQuestions} questions, ${totalImportedOptions} options, ${totalSourcesLinked} sources.`);

  await client.end();
}

main().catch(console.error);
