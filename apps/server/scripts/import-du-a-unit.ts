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
const UNIV_CODE = "UNI_J32I8G"; // Dhaka University
const UNIT_CODE = "UNI_6321c505"; // A Unit

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
      unit: parts[1] || "Unit-A",
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
        console.error(`Error fetching page ${params.page} for topic ${params.topic}:`, e);
        return { questions: [], hasMore: false };
      }
      await new Promise(res => setTimeout(res, 300 * (r + 1)));
    }
  }

  return { questions: [], hasMore: false };
}

async function main() {
  console.log("=====================================================================");
  console.log("🚀 DU (Dhaka University) -> A Unit Question Bank Importer");
  console.log("=====================================================================\n");

  const dbUrl = process.env.DATABASE_URL || "postgresql://paws:df8f13a4@127.0.0.1:5432/paws";
  const client = postgres(dbUrl, { max: 15 });
  const db = drizzle(client);

  // 1. Ensure Target: Dhaka University
  console.log("1️⃣ Setting up Target: 'Dhaka University'...");
  const [target] = await db.insert(qbTargets).values({
    group: "admission",
    name: "Dhaka University",
    slug: "dhaka-university",
    orderIndex: 1
  }).onConflictDoUpdate({
    target: qbTargets.slug,
    set: { name: "Dhaka University" }
  }).returning();

  // 2. Ensure Container: Dhaka University Question Bank
  console.log("2️⃣ Setting up Container: 'Dhaka University Question Bank'...");
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

  // 3. Ensure Container Item: A Unit (বিজ্ঞান অনুষদ)
  console.log("3️⃣ Setting up Container Item: 'A Unit (বিজ্ঞান অনুষদ)'...");
  const [containerItem] = await db.insert(qbContainerItems).values({
    containerId: container.id,
    name: "A Unit (বিজ্ঞান অনুষদ)",
    slug: "a-unit",
    description: "DU A Unit Admission Question Archive",
    orderIndex: 1
  }).onConflictDoUpdate({
    target: [qbContainerItems.containerId, qbContainerItems.slug],
    set: { name: "A Unit (বিজ্ঞান অনুষদ)" }
  }).returning();

  // 4. Load Scraper Lookup Index to find our DB Subject, Chapter, and Topic UUIDs
  console.log("4️⃣ Loading taxonomy lookup index...");
  const lookupIndex = await Bun.file("/root/Hulk/data/studyclub/scraper_lookup_index.json").json();
  const rawSubjData = await Bun.file("/root/Hulk/data/studyclub/all_subjects_chapters_topics.json").json();

  // Query all DB topics, chapters, subjects into memory for high-speed resolution
  const dbSubjects = await db.select().from(qbSubjects);
  const dbChapters = await db.select().from(qbChapters);
  const dbTopics = await db.select().from(qbTopics);

  const subjectCodeToDbMap = new Map<string, string>(); // code -> id
  dbSubjects.forEach(s => { if (s.code) subjectCodeToDbMap.set(s.code, s.id); });

  // 5. Discover all units and topics under DU A Unit
  console.log("5️⃣ Discovering all Subject/Chapter/Topic tasks for DU A Unit...\n");
  const yearRes = await fetch(`https://studyclubd.com/qb-archive/includes/ajax.php?ajax=1&step=year&university=${UNIV_CODE}&unit=${UNIT_CODE}`, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
  });
  const yearData = await yearRes.json();
  const $y = cheerio.load(yearData.html || "");

  interface ScrapingTask {
    subjectId: string;
    subjectName: string;
    chapterId: string;
    chapterName: string;
    topicId: string;
    topicName: string;
    dbTopicId: string | null;
  }

  const tasks: ScrapingTask[] = [];

  const subjElements = $y("#tab-content-subject .bg-white").toArray();

  for (const sEl of subjElements) {
    const card = $y(sEl);
    const header = card.find(".flex.justify-between").first();
    const onclick = header.attr("onclick") || "";
    const matchSub = onclick.match(/SUB_[a-zA-Z0-9]+/);
    if (!matchSub) continue;

    const subCode = matchSub[0];
    const rawSubjName = header.find("span.font-bold").first().text().trim();

    // Fetch chapters for this subject
    const chapRes = await fetch(`https://studyclubd.com/qb-archive/includes/ajax.php?ajax=1&step=chapters&university=${UNIV_CODE}&unit=${UNIT_CODE}&subject=${subCode}`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    });
    const chapData = await chapRes.json();
    const $c = cheerio.load(chapData.html || "");

    const chapElements = $c(".border.border-gray-100").toArray();

    for (const cEl of chapElements) {
      const cHeader = $c(cEl).find(".flex.justify-between").first();
      const cOnclick = cHeader.attr("onclick") || "";
      const matchChap = cOnclick.match(/CHA_[a-zA-Z0-9]+/);
      if (!matchChap) continue;

      const chapCode = matchChap[0];
      const rawChapName = cHeader.find("span.font-semibold").text().trim();

      // Fetch topics for this chapter
      const topRes = await fetch(`https://studyclubd.com/qb-archive/includes/ajax.php?ajax=1&step=topics&university=${UNIV_CODE}&unit=${UNIT_CODE}&subject=${subCode}&chapter=${chapCode}`, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
      });
      const topData = await topRes.json();
      const $t = cheerio.load(topData.html || "");

      $t(".flex.justify-between").each((_, tEl) => {
        const btn = $t(tEl).find("button");
        const tOnclick = btn.attr("onclick") || "";
        const matchTop = tOnclick.match(/TOP_[a-zA-Z0-9]+/);
        if (matchTop) {
          const topCode = matchTop[0];
          const topName = $t(tEl).find("span.truncate").text().trim();

          // Match DB topic ID
          const dbTop = dbTopics.find(t => t.slug.includes(topCode.toLowerCase()));

          tasks.push({
            subjectId: subCode,
            subjectName: rawSubjName,
            chapterId: chapCode,
            chapterName: rawChapName,
            topicId: topCode,
            topicName: topName,
            dbTopicId: dbTop ? dbTop.id : null
          });
        }
      });
    }
  }

  console.log(`🎯 Discovered ${tasks.length} specific topic queues for DU A Unit.`);
  console.log(`⚡ Starting concurrent question scraper and DB importer...\n`);

  let totalImportedQuestions = 0;
  let totalImportedOptions = 0;
  let totalSourcesLinked = 0;
  let completedTasks = 0;

  // Source cache to minimize DB calls
  const sourceCache = new Map<string, string>(); // slug -> id

  const workerCount = 6;
  let taskIndex = 0;

  async function worker() {
    while (taskIndex < tasks.length) {
      const currentTask = tasks[taskIndex++];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const result = await fetchQuestions({
          subject: currentTask.subjectId,
          chapter: currentTask.chapterId,
          topic: currentTask.topicId,
          page
        });

        if (result.questions.length === 0) break;

        for (const q of result.questions) {
          try {
            // Insert Question
            const [qRow] = await db.insert(qbQuestions).values({
              topicId: currentTask.dbTopicId,
              qType: "mcq",
              questionText: q.questionText,
              status: "published",
              orderIndex: parseInt(q.number) || 0
            }).returning({ id: qbQuestions.id });

            totalImportedQuestions++;

            // Insert Options
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

            // Handle Meta Tags & Sources
            const metaList = parseAndDeduplicateMetaTags(q.meta);
            for (const meta of metaList) {
              const sSlug = `${meta.institution}-${meta.unit || "unit-a"}-${meta.year || "all"}`.toLowerCase().replace(/[^\w-]/g, "-");
              
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

              // Link question to source
              await db.insert(qbQuestionSources).values({
                questionId: qRow.id,
                sourceId: sourceId
              }).onConflictDoNothing();

              totalSourcesLinked++;
            }
          } catch (err) {
            // Skip unique or parsing glitches
          }
        }

        hasMore = result.hasMore;
        page++;
      }

      completedTasks++;
      process.stdout.write(
        `\r[PROGRESS] [${completedTasks}/${tasks.length} Topics] Imported Questions: ${totalImportedQuestions} | Options: ${totalImportedOptions} | Sources Linked: ${totalSourcesLinked} `
      );
    }
  }

  const workers = Array.from({ length: workerCount }, () => worker());
  await Promise.all(workers);

  // Update counts on Container, Container Item, and Target
  await db.update(qbContainers).set({
    questionCount: totalImportedQuestions,
    itemCount: 1
  }).where(eq(qbContainers.id, container.id));

  await db.update(qbContainerItems).set({
    questionCount: totalImportedQuestions
  }).where(eq(qbContainerItems.id, containerItem.id));

  await db.update(qbTargets).set({
    questionCount: totalImportedQuestions
  }).where(eq(qbTargets.id, target.id));

  console.log("\n\n=====================================================================");
  console.log("🎉 DU A Unit Question Import Completed Successfully!");
  console.log(`✅ Total Questions Saved: ${totalImportedQuestions}`);
  console.log(`✅ Total Options Saved:   ${totalImportedOptions}`);
  console.log(`✅ Total Sources Linked:  ${totalSourcesLinked}`);
  console.log(`📁 Target:        'Dhaka University' (ID: ${target.id})`);
  console.log(`📁 Container:     'Dhaka University Question Bank' (ID: ${container.id})`);
  console.log(`📁 ContainerItem: 'A Unit (বিজ্ঞান অনুষদ)' (ID: ${containerItem.id})`);
  console.log("=====================================================================\n");

  await client.end();
}

main().catch(console.error);
