import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { eq, inArray } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { db } from "../src/db";
import {
  qbChapterSources,
  qbChapters,
  qbContainerItems,
  qbExamSheetQuestions,
  qbExamSheets,
  qbQuestionChapters,
  qbQuestionOptions,
  qbQuestionParts,
  qbQuestionSources,
  qbQuestions,
  qbSources,
  qbTopics,
} from "../src/db/schema";
import { recalculateAllCounts } from "../src/services/qb-count.service";

const CHORCHA_TOKEN = process.env.CHORCHA_TOKEN;
const S3_ENDPOINT =
  process.env.AWS_ENDPOINT_URL_S3 || process.env.AWS_ENDPOINT || "https://s3.prohor.dev";
const S3_BUCKET = process.env.S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME || "study";
const S3_REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "garage";
const S3_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY || "";
const S3_SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_KEY || "";
const S3_PUBLIC_URL = (
  process.env.AWS_PUBLIC_URL ||
  process.env.S3_BUCKET_URL ||
  "https://study.storage.prohor.dev"
).replace(/\/+$/, "");

const s3Client = new S3Client({
  endpoint: S3_ENDPOINT,
  region: S3_REGION,
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY,
  },
  forcePathStyle: true,
});

function decodeChorcha(text: string | null | undefined, key: string | null): string {
  if (!text || !key) return text || "";
  const chars: string[] = [];
  for (let i = 0; i < text.length; i++) {
    const diff = (text.charCodeAt(i) - key.charCodeAt(i % 16)) & 0xffff;
    chars.push(String.fromCharCode(diff));
  }
  return chars.join("").replace(/\0/g, "");
}

function isDummyOption(text: string | null | undefined): boolean {
  if (!text) return true;
  const clean = text
    .replace(/<[^>]+>/g, "")
    .trim()
    .toLowerCase();
  return (
    clean === "done" || clean === "skip" || clean === "পেরেছি" || clean === "পারিনি" || clean === ""
  );
}

function cleanSolutionText(text: string | null | undefined): string | null {
  if (!text) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\uFFFD\uFFF0-\uFFFF]/.test(trimmed)) {
    return null;
  }
  return trimmed;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const imageCache = new Map<string, string>();

async function migrateImagesInText(html: string | null | undefined): Promise<string> {
  if (!html) return html || "";

  const chorchaUrlRegex = /https?:\/\/assets\.chorcha\.net\/([^\s"'<>()\\]+)/gi;
  const matches = Array.from(html.matchAll(chorchaUrlRegex));
  if (matches.length === 0) return html;

  let result = html;
  for (const match of matches) {
    const fullUrl = match[0];
    const pathPart = match[1];

    if (imageCache.has(fullUrl)) {
      result = result.replace(fullUrl, imageCache.get(fullUrl)!);
      continue;
    }

    try {
      const cleanPath = pathPart.replace(/[^\w./-]/g, "");
      const ext = cleanPath.split(".").pop() || "png";
      const filename = `${uuidv7()}.${ext}`;
      const s3Key = `qb/images/${filename}`;
      const s3Url = `${S3_PUBLIC_URL}/${s3Key}`;

      const res = await fetch(fullUrl, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });

      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);
        const contentType = res.headers.get("content-type") || `image/${ext}`;

        await s3Client.send(
          new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: s3Key,
            Body: buffer,
            ContentType: contentType,
            CacheControl: "public, max-age=31536000, immutable",
          }),
        );

        imageCache.set(fullUrl, s3Url);
        result = result.replace(fullUrl, s3Url);
      }
    } catch (err) {
      console.error(`Failed to migrate image ${fullUrl}:`, err);
    }
  }

  return result;
}

interface EngineeringSeriesConfig {
  seriesId: string;
  name: string;
  containerItemSlug: string;
  institutionName: string;
  unitName: string;
  prefixTag: string;
}

const TARGET_SERIES: EngineeringSeriesConfig[] = [
  {
    seriesId: "SL0UXnXHc3",
    name: "BUET Admission Question Bank",
    containerItemSlug: "buet-qb",
    institutionName: "Bangladesh University of Engineering and Technology (BUET)",
    unitName: "Engineering Admission",
    prefixTag: "BUET",
  },
  {
    seriesId: "F9-yce3zYH",
    name: "CKRUET Admission Question Bank",
    containerItemSlug: "ckruet-qb",
    institutionName: "CKRUET Engineering Cluster",
    unitName: "Cluster Admission",
    prefixTag: "CKRUET",
  },
  {
    seriesId: "J5lMzxtZww",
    name: "RUET Admission Question Bank",
    containerItemSlug: "ruet-qb",
    institutionName: "Rajshahi University of Engineering & Technology (RUET)",
    unitName: "RUET Admission",
    prefixTag: "RUET",
  },
  {
    seriesId: "H6N58DZy63",
    name: "KUET Admission Question Bank",
    containerItemSlug: "kuet-qb",
    institutionName: "Khulna University of Engineering & Technology (KUET)",
    unitName: "KUET Admission",
    prefixTag: "KUET",
  },
  {
    seriesId: "bLFGJU3Yaz",
    name: "CUET Admission Question Bank",
    containerItemSlug: "cuet-qb",
    institutionName: "Chittagong University of Engineering & Technology (CUET)",
    unitName: "CUET Admission",
    prefixTag: "CUET",
  },
  {
    seriesId: "P4qBaI_uYL",
    name: "IUT Admission Question Bank",
    containerItemSlug: "iut-qb",
    institutionName: "Islamic University of Technology (IUT)",
    unitName: "IUT Admission",
    prefixTag: "IUT",
  },
  {
    seriesId: "ebJQgH2h1q",
    name: "BUTEX Admission Question Bank",
    containerItemSlug: "butex-qb",
    institutionName: "Bangladesh University of Textiles (BUTEX)",
    unitName: "BUTEX Admission",
    prefixTag: "BUTEX",
  },
  {
    seriesId: "c8q6-XoCwO",
    name: "MIST Admission Question Bank",
    containerItemSlug: "mist-qb",
    institutionName: "Military Institute of Science and Technology (MIST)",
    unitName: "MIST Admission",
    prefixTag: "MIST",
  },
];

async function scrapeSeries(config: EngineeringSeriesConfig) {
  console.log(`\n======================================================`);
  console.log(`>>> Starting Ingestion for: ${config.name} (${config.seriesId})`);
  console.log(`======================================================`);

  const [containerItem] = await db
    .select()
    .from(qbContainerItems)
    .where(eq(qbContainerItems.slug, config.containerItemSlug));

  if (!containerItem) {
    throw new Error(`Container item "${config.containerItemSlug}" not found in database!`);
  }

  // Load topics, chapters, sources cache
  const allTopics = await db.select().from(qbTopics);
  const allChapters = await db.select().from(qbChapters);
  const allSources = await db.select().from(qbSources);

  const topicSlugMap = new Map(allTopics.map((t) => [t.slug, t]));
  const topicIdMap = new Map(allTopics.map((t) => [t.id, t]));
  const chapterIdMap = new Map(allChapters.map((c) => [c.id, c]));
  const chapterSlugMap = new Map(allChapters.map((c) => [c.slug, c]));
  const sourceSlugMap = new Map(allSources.map((s) => [s.slug, s]));

  // 1. Fetch Topic Hierarchy from Chorcha
  console.log(`Fetching topic hierarchy from Chorcha...`);
  const topicRes = await fetch(`https://api.chorcha.net/topics/series/${config.seriesId}`, {
    headers: { Authorization: `Bearer ${CHORCHA_TOKEN}` },
  });
  const topicJson = await topicRes.json();
  const nodesMap = topicJson.data?.data?.nodes || {};
  const parentMap = topicJson.data?.data?.parent || {};
  console.log(`Chorcha nodes mapped: ${Object.keys(nodesMap).length}`);

  function resolveChapterAndTopic(chorchaTopicSlug: string | null | undefined): {
    topicId: string | null;
    chapterId: string | null;
  } {
    if (!chorchaTopicSlug) return { topicId: null, chapterId: null };

    const dbTopic = topicSlugMap.get(chorchaTopicSlug);
    if (dbTopic) {
      if (dbTopic.chapterId) {
        return { topicId: dbTopic.id, chapterId: dbTopic.chapterId };
      }
      let curr = dbTopic;
      while (curr && curr.parentId) {
        if (chapterIdMap.has(curr.parentId)) {
          return { topicId: dbTopic.id, chapterId: curr.parentId };
        }
        curr = topicIdMap.get(curr.parentId)!;
      }
      return { topicId: dbTopic.id, chapterId: null };
    }

    const dbChapter = chapterSlugMap.get(chorchaTopicSlug);
    if (dbChapter) {
      return { topicId: null, chapterId: dbChapter.id };
    }

    let currentChorchaId = chorchaTopicSlug;
    while (currentChorchaId && parentMap[currentChorchaId]) {
      const parentId = parentMap[currentChorchaId];
      if (topicSlugMap.has(parentId)) {
        const pTopic = topicSlugMap.get(parentId)!;
        return { topicId: pTopic.id, chapterId: pTopic.chapterId ?? null };
      }
      if (chapterSlugMap.has(parentId)) {
        const pChap = chapterSlugMap.get(parentId)!;
        return { topicId: null, chapterId: pChap.id };
      }
      currentChorchaId = parentId;
    }

    return { topicId: null, chapterId: null };
  }

  // 2. Fetch all pages of questions
  let page = 1;
  const allQuestions: any[] = [];

  while (true) {
    const url = `https://api.chorcha.net/read/series/${config.seriesId}?topic=root&page=${page}&filters=&label_filter=`;
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${CHORCHA_TOKEN}` },
      });

      if (!res.ok) {
        console.error(`Page ${page} returned status ${res.status}. Ending stream.`);
        break;
      }

      const key = res.headers.get("x-chorcha-id");
      const json = await res.json();
      const questions = json.data?.questions || [];

      if (!questions || questions.length === 0) {
        console.log(`No more questions on page ${page}. Total fetched: ${allQuestions.length}`);
        break;
      }

      for (const q of questions) {
        q._decryptedQuestion = decodeChorcha(q.question, key);
        q._decryptedA = decodeChorcha(q.A, key);
        q._decryptedB = decodeChorcha(q.B, key);
        q._decryptedC = decodeChorcha(q.C, key);
        q._decryptedD = decodeChorcha(q.D, key);
        q._decryptedSolution = cleanSolutionText(decodeChorcha(q.solution, key));
        allQuestions.push(q);
      }

      console.log(
        `  Fetched page ${page}: ${questions.length} questions (Accumulated: ${allQuestions.length})`,
      );
      page++;
      await new Promise((r) => setTimeout(r, 60));
    } catch (err) {
      console.error(`Error on page ${page}:`, err);
      break;
    }
  }

  console.log(`\nTotal questions downloaded for ${config.name}: ${allQuestions.length}`);

  // 3. Group questions by exam year / primary tag
  const examGroups = new Map<string, any[]>();

  for (const q of allQuestions) {
    const rawTagStr = String(q.tags || q.tag || "").trim();
    const tagsList = rawTagStr.split(",").map((s) => s.trim());
    let primaryTag = tagsList.find((t) => t.toUpperCase().includes(config.prefixTag.toUpperCase()));

    if (!primaryTag) {
      primaryTag = tagsList[0] || `${config.prefixTag} General`;
    }

    const groupKey = primaryTag;
    if (!examGroups.has(groupKey)) {
      examGroups.set(groupKey, []);
    }
    examGroups.get(groupKey)!.push(q);
  }

  console.log(`Identified ${examGroups.size} distinct Exam Sets / Years.`);

  let sheetOrder = 1;
  let totalSaved = 0;

  for (const [groupTag, qList] of examGroups.entries()) {
    const sheetTitle = `${config.name} - ${groupTag}`;
    const sheetSlug = slugify(`${config.containerItemSlug}-${groupTag}`);

    // Determine exam sheet type based on whether it has MCQs or Written
    let hasMCQInSheet = false;
    let hasWrittenInSheet = false;
    for (const q of qList) {
      const decA = (q._decryptedA || "").trim();
      const decB = (q._decryptedB || "").trim();
      const isMCQ =
        decA.length > 0 && decB.length > 0 && !isDummyOption(decA) && !isDummyOption(decB);
      if (isMCQ) hasMCQInSheet = true;
      else hasWrittenInSheet = true;
    }

    const sheetExamType =
      hasMCQInSheet && !hasWrittenInSheet
        ? "mcq"
        : hasWrittenInSheet && !hasMCQInSheet
          ? "written"
          : "mcq";

    // Check if sheet already exists
    const [existingSheet] = await db
      .select()
      .from(qbExamSheets)
      .where(eq(qbExamSheets.slug, sheetSlug));

    let examSheet = existingSheet;
    if (!examSheet) {
      const newEsId = uuidv7();
      [examSheet] = await db
        .insert(qbExamSheets)
        .values({
          id: newEsId,
          containerItemId: containerItem.id,
          title: sheetTitle,
          slug: sheetSlug,
          examType: sheetExamType,
          durationMinutes: 60,
          totalMarks: String(qList.length),
          negativeMarks: "0.25",
          orderIndex: sheetOrder++,
          questionCount: qList.length,
        })
        .returning();
      console.log(
        `\nCreated Exam Sheet: "${sheetTitle}" [${sheetExamType.toUpperCase()}] (${qList.length} questions)`,
      );
    } else {
      console.log(`\nExam Sheet "${sheetTitle}" exists (${examSheet.id}). Checking questions...`);
    }

    // Check existing questions in this exam sheet
    const existingSheetQuestions = await db
      .select({ questionId: qbExamSheetQuestions.questionId })
      .from(qbExamSheetQuestions)
      .where(eq(qbExamSheetQuestions.examSheetId, examSheet.id));

    if (existingSheetQuestions.length > 0) {
      if (existingSheetQuestions.length >= qList.length) {
        console.log(
          `  Exam Sheet already has ${existingSheetQuestions.length} questions. Skipping.`,
        );
        continue;
      }
      const qIdsToDelete = existingSheetQuestions.map((esq) => esq.questionId);
      if (qIdsToDelete.length > 0) {
        await db
          .delete(qbExamSheetQuestions)
          .where(eq(qbExamSheetQuestions.examSheetId, examSheet.id));
        await db
          .delete(qbQuestionOptions)
          .where(inArray(qbQuestionOptions.questionId, qIdsToDelete));
        await db
          .delete(qbQuestionChapters)
          .where(inArray(qbQuestionChapters.questionId, qIdsToDelete));
        await db
          .delete(qbQuestionSources)
          .where(inArray(qbQuestionSources.questionId, qIdsToDelete));
        await db.delete(qbQuestions).where(inArray(qbQuestions.id, qIdsToDelete));
        console.log(
          `  Cleaned up ${qIdsToDelete.length} partial questions from previous incomplete run.`,
        );
      }
    }

    for (let qIdx = 0; qIdx < qList.length; qIdx++) {
      const q = qList[qIdx];
      const qId = uuidv7();

      // Topic & Chapter matching
      const { topicId, chapterId } = resolveChapterAndTopic(q.topic);

      // Clean HTML & Migrate images to S3
      const cleanQuestion = await migrateImagesInText(q._decryptedQuestion);
      const cleanSolution = q._decryptedSolution
        ? await migrateImagesInText(q._decryptedSolution)
        : null;

      const decA = (q._decryptedA || "").trim();
      const decB = (q._decryptedB || "").trim();
      const decC = (q._decryptedC || "").trim();
      const decD = (q._decryptedD || "").trim();

      // Precise MCQ detection: has real options that are not dummy placeholder buttons
      const isMCQ =
        decA.length > 0 && decB.length > 0 && !isDummyOption(decA) && !isDummyOption(decB);
      const qType = isMCQ ? "mcq" : "written";

      await db.insert(qbQuestions).values({
        id: qId,
        topicId: topicId,
        qType: qType,
        questionText: cleanQuestion,
        explanation: cleanSolution,
        orderIndex: qIdx + 1,
        status: "published",
      });

      // Insert MCQ Options only if it is a real MCQ
      if (isMCQ) {
        const optTexts = [
          { key: "A", text: await migrateImagesInText(decA), orderIndex: 1 },
          { key: "B", text: await migrateImagesInText(decB), orderIndex: 2 },
          { key: "C", text: await migrateImagesInText(decC), orderIndex: 3 },
          { key: "D", text: await migrateImagesInText(decD), orderIndex: 4 },
        ].filter((o) => o.text && o.text.trim().length > 0);

        for (const opt of optTexts) {
          await db.insert(qbQuestionOptions).values({
            id: uuidv7(),
            questionId: qId,
            optionText: opt.text,
            isCorrect: opt.key === (q.answer || "").trim(),
            orderIndex: opt.orderIndex,
          });
        }
      }

      // Link Chapter
      if (chapterId) {
        await db
          .insert(qbQuestionChapters)
          .values({
            questionId: qId,
            chapterId: chapterId,
          })
          .onConflictDoNothing();
      }

      // Link Exam Sheet
      await db.insert(qbExamSheetQuestions).values({
        examSheetId: examSheet.id,
        questionId: qId,
        questionNumber: qIdx + 1,
      });

      // Link Sources / Tags
      const rawTags: string[] = [];
      if (q.tags) {
        if (typeof q.tags === "string")
          rawTags.push(...q.tags.split(",").map((s: string) => s.trim()));
        else if (Array.isArray(q.tags))
          rawTags.push(...q.tags.map((s: unknown) => String(s).trim()));
      }
      if (q.tag) rawTags.push(String(q.tag).trim());

      const cleanTags = Array.from(new Set(rawTags.filter((t) => t && t.length > 0)));
      for (const tagStr of cleanTags) {
        const tagSlug = slugify(tagStr);
        let source = sourceSlugMap.get(tagSlug);
        if (!source) {
          const yearMatch = tagStr.match(/\d{2,4}/)?.[0] || "2024";
          const parsedYear =
            yearMatch.length === 2 ? 2000 + parseInt(yearMatch, 10) : parseInt(yearMatch, 10);

          [source] = await db
            .insert(qbSources)
            .values({
              id: uuidv7(),
              sourceGroup: "admission",
              type: "engineering",
              name: tagStr,
              slug: tagSlug,
              institution: config.institutionName,
              unit: config.unitName,
              year: parsedYear,
              questionCount: 0,
            })
            .returning();
          sourceSlugMap.set(tagSlug, source);
        }

        await db
          .insert(qbQuestionSources)
          .values({
            questionId: qId,
            sourceId: source.id,
          })
          .onConflictDoNothing();

        if (chapterId) {
          await db
            .insert(qbChapterSources)
            .values({
              chapterId: chapterId,
              sourceId: source.id,
            })
            .onConflictDoNothing();
        }
      }

      totalSaved++;
      if (totalSaved % 50 === 0) {
        process.stdout.write(`    Saved ${totalSaved} questions so far...\r`);
      }
    }
  }

  console.log(`\nCompleted ingestion for ${config.name}! Total questions saved: ${totalSaved}`);
}

async function main() {
  console.log("=== PAWS ACADEMY ENGINEERING QB INGESTION & S3 SYNC ===");
  console.log(`Target Series Count: ${TARGET_SERIES.length}`);

  for (const config of TARGET_SERIES) {
    await scrapeSeries(config);
  }

  console.log("\n======================================================");
  console.log("All 8 Engineering Question Banks scraped & synced successfully!");
  console.log("Recalculating all question & exam counts in database...");
  await recalculateAllCounts();
  console.log("All counts recalculated! Engineering QB is live and ready.");
  console.log("======================================================");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("FATAL SCRAPER ERROR:", err);
    process.exit(1);
  });
