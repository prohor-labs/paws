import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
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
const S3_ENDPOINT = process.env.S3_ENDPOINT || "https://s3.prohor.dev";
const S3_BUCKET = process.env.S3_BUCKET || "study";
const S3_REGION = process.env.S3_REGION || "us-east-1";
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || "";
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || "";
const S3_PUBLIC_URL = (process.env.S3_PUBLIC_URL || "https://study.storage.prohor.dev").replace(
  /\/+$/,
  "",
);

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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// In-memory cache for uploaded S3 images to avoid duplicate downloads/uploads
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

interface SeriesConfig {
  seriesId: string;
  name: string;
  containerItemSlug: string;
  institutionName: string;
  unitName: string;
  prefixTag: string; // e.g., "MAT", "DAT", "AFMC"
}

const TARGET_SERIES: SeriesConfig[] = [
  {
    seriesId: "-KjN72iFB8",
    name: "Medical Admission (MBBS)",
    containerItemSlug: "mbbs-past-questions",
    institutionName: "Directorate General of Health Services (DGHS)",
    unitName: "MBBS Admission",
    prefixTag: "MAT",
  },
  {
    seriesId: "ee-AWP10mv",
    name: "Dental Admission (BDS)",
    containerItemSlug: "bds-past-questions",
    institutionName: "Directorate General of Health Services (DGHS)",
    unitName: "BDS Admission",
    prefixTag: "DAT",
  },
  {
    seriesId: "z8xUZQqs6h",
    name: "Armed Forces Medical College (AFMC)",
    containerItemSlug: "afmc-past-questions",
    institutionName: "Armed Forces Medical College (AFMC)",
    unitName: "AFMC / AMC Admission",
    prefixTag: "AFMC",
  },
];

async function scrapeSeries(config: SeriesConfig) {
  console.log(`\n======================================================`);
  console.log(`>>> Starting Scraper for: ${config.name} (${config.seriesId})`);
  console.log(`======================================================`);

  const [containerItem] = await db
    .select()
    .from(qbContainerItems)
    .where(eq(qbContainerItems.slug, config.containerItemSlug));

  if (!containerItem) {
    throw new Error(`Container item ${config.containerItemSlug} not found in database!`);
  }

  // Load topics, chapters, sources cache
  const allTopics = await db.select().from(qbTopics);
  const allChapters = await db.select().from(qbChapters);
  const allSources = await db.select().from(qbSources);

  const topicSlugMap = new Map(allTopics.map((t) => [t.slug, t]));
  const topicIdMap = new Map(allTopics.map((t) => [t.id, t]));
  const chapterIdMap = new Map(allChapters.map((c) => [c.id, c]));
  const sourceSlugMap = new Map(allSources.map((s) => [s.slug, s]));

  function getChapterIdForTopic(topicId: string) {
    let curr = topicIdMap.get(topicId);
    while (curr) {
      if (curr.parentId) {
        if (chapterIdMap.has(curr.parentId)) {
          return curr.parentId;
        }
        curr = topicIdMap.get(curr.parentId);
      } else {
        break;
      }
    }
    return null;
  }

  // 1. Fetch Topic Hierarchy from Chorcha
  console.log(`Fetching topic hierarchy from Chorcha...`);
  const topicRes = await fetch(`https://api.chorcha.net/topics/series/${config.seriesId}`, {
    headers: { Authorization: `Bearer ${CHORCHA_TOKEN}` },
  });
  const topicJson = await topicRes.json();
  const nodesMap = topicJson.data?.data?.nodes || {};
  console.log(`Chorcha nodes mapped: ${Object.keys(nodesMap).length}`);

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
        q._decryptedSolution = q.solution ? decodeChorcha(q.solution, key) : null;
        allQuestions.push(q);
      }

      console.log(
        `  Fetched page ${page}: ${questions.length} questions (Accumulated: ${allQuestions.length})`,
      );
      page++;
      await new Promise((r) => setTimeout(r, 100)); // rate limit safety
    } catch (err) {
      console.error(`Error on page ${page}:`, err);
      break;
    }
  }

  console.log(`\nTotal questions downloaded for ${config.name}: ${allQuestions.length}`);

  // 3. Group questions by exam year / primary tag (e.g. MAT 24-25, MAT 23-24, or fallback to Series Name)
  const examGroups = new Map<string, any[]>();

  for (const q of allQuestions) {
    const rawTagStr = String(q.tags || q.tag || "").trim();
    // Match primary tag matching prefix (e.g. "MAT 24-25", "DAT 22-23", "AFMC 23-24")
    const tagsList = rawTagStr.split(",").map((s) => s.trim());
    let primaryTag = tagsList.find((t) => t.toUpperCase().includes(config.prefixTag));

    if (!primaryTag) {
      primaryTag = tagsList[0] || `${config.prefixTag} General`;
    }

    // Clean up primary tag e.g. "MAT 24-25", "MAT+DAT-25-26" -> readable Exam Sheet Title
    const groupKey = primaryTag;
    if (!examGroups.has(groupKey)) {
      examGroups.set(groupKey, []);
    }
    examGroups.get(groupKey)!.push(q);
  }

  console.log(`Identified ${examGroups.size} distinct Exam Sets / Years.`);

  let sheetOrder = 1;
  for (const [groupTag, qList] of examGroups.entries()) {
    const sheetTitle = `${config.name} - ${groupTag}`;
    const sheetSlug = slugify(`${config.containerItemSlug}-${groupTag}`);

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
          examType: "mcq",
          durationMinutes: 60,
          totalMarks: String(qList.length),
          negativeMarks: "0.25",
          orderIndex: sheetOrder++,
          questionCount: qList.length,
        })
        .returning();
      console.log(`\nCreated Exam Sheet: "${sheetTitle}" (${qList.length} questions)`);
    } else {
      console.log(`\nExam Sheet "${sheetTitle}" exists (${examSheet.id}). Processing questions...`);
    }

    for (let qIdx = 0; qIdx < qList.length; qIdx++) {
      const q = qList[qIdx];
      const qId = uuidv7();

      // Topic & Chapter matching
      const chorchaTopicSlug = q.topic;
      const dbTopic = chorchaTopicSlug ? topicSlugMap.get(chorchaTopicSlug) : null;
      let chId: string | null = null;
      if (dbTopic?.id) {
        chId = getChapterIdForTopic(dbTopic.id);
      }

      // Migrate images in question, options, solution to S3
      const cleanQuestion = await migrateImagesInText(q._decryptedQuestion);
      const cleanSolution = await migrateImagesInText(q._decryptedSolution);

      const isWritten = q.type?.includes("CQ") || q.type?.includes("WRITTEN");
      const qType = isWritten ? "written" : "mcq";

      await db.insert(qbQuestions).values({
        id: qId,
        topicId: dbTopic?.id ?? null,
        qType: qType,
        questionText: cleanQuestion,
        explanation: cleanSolution,
        orderIndex: qIdx + 1,
        status: "published",
      });

      // Insert Options
      if (qType === "mcq") {
        const optTexts = [
          {
            key: "A",
            text: await migrateImagesInText(q._decryptedA),
            orderIndex: 1,
          },
          {
            key: "B",
            text: await migrateImagesInText(q._decryptedB),
            orderIndex: 2,
          },
          {
            key: "C",
            text: await migrateImagesInText(q._decryptedC),
            orderIndex: 3,
          },
          {
            key: "D",
            text: await migrateImagesInText(q._decryptedD),
            orderIndex: 4,
          },
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
      if (chId) {
        await db
          .insert(qbQuestionChapters)
          .values({
            questionId: qId,
            chapterId: chId,
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
              type: "medical",
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

        if (chId) {
          await db
            .insert(qbChapterSources)
            .values({
              chapterId: chId,
              sourceId: source.id,
            })
            .onConflictDoNothing();
        }
      }
    }
  }

  console.log(`\nCompleted ingestion for ${config.name}!`);
}

async function main() {
  console.log("=== PAWS ACADEMY MEDICAL QB INGESTION & S3 SYNC ===");

  for (const config of TARGET_SERIES) {
    await scrapeSeries(config);
  }

  console.log("\n======================================================");
  console.log("All Medical, Dental, and AFMC questions scraped & synced!");
  console.log("Recalculating all question & exam counts in database...");
  await recalculateAllCounts();
  console.log("All counts recalculated! Medical QB is live and ready.");
  console.log("======================================================");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("FATAL SCRAPER ERROR:", err);
    process.exit(1);
  });
