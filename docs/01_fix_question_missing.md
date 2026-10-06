# Fixing Missing Questions & Syncing University Question Banks

This guide documents the complete end-to-end pipeline to recover, decrypt, migrate images, and ingest missing questions from Chorcha exams into the question bank database (`qb_*`), as well as how to standardize exam sheets and source metadata for any university or unit.

---

## 1. Problem Context & Root Cause

When question banks are imported from Chorcha:
1. **Topic-Filtered Scrapers Drop Questions:** Scraping by topic or chapter only retrieves questions that Chorcha explicitly tagged with a HSC topic. Any questions lacking topic tags or tagged with miscellaneous university abbreviations get lost.
2. **True Source of Truth:** Chorcha's full exam sets exist under the `/read/:examId` endpoint (e.g. `https://chorcha.net/read/<examId>`), which contains the complete, un-truncated exam questions.
3. **Image Expiry / Hotlinking:** Chorcha images hosted on `assets.chorcha.net` must be downloaded, converted, and permanently uploaded to the project's S3 storage (`https://study.storage.prohor.dev/qb/images/`).
4. **Decryption Required:** Chorcha payloads are encrypted using a rolling modulo difference cipher with a session key provided in the response header `x-chorcha-id`.

---

## 2. Chorcha Decryption & Solution Cleaning

### Decryption Cipher
Every text field (`question`, `solution`, `A`, `B`, `C`, `D`) must be decoded using the key from `x-chorcha-id`:

```typescript
function decodeChorcha(text: string | null | undefined, key: string | null): string {
  if (!text || !key) return text || "";
  const chars: string[] = [];
  for (let i = 0; i < text.length; i++) {
    const diff = (text.charCodeAt(i) - key.charCodeAt(i % 16)) & 0xffff;
    chars.push(String.fromCharCode(diff));
  }
  return chars.join("").replace(/\0/g, "");
}
```

### Solution Cleaning
Chorcha frequently returns corrupted unicode characters or null bytes when an explanation does not exist:

```typescript
function cleanSolutionText(text: string | null | undefined): string | null {
  if (!text) return null;
  const trimmed = text.trim();
  if (!trimmed || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\uFFFD\uFFF0-\uFFFF]/.test(trimmed)) {
    return null;
  }
  return trimmed;
}
```

---

## 3. S3 Image Migration Pipeline

Any image found in HTML text (`assets.chorcha.net`) must be downloaded and uploaded to S3:

```typescript
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v7 as uuidv7 } from "uuid";

const S3_ENDPOINT = process.env.AWS_ENDPOINT_URL_S3 || "https://s3.prohor.dev";
const S3_BUCKET = process.env.S3_BUCKET_NAME || "study";
const S3_REGION = process.env.AWS_REGION || "garage";
const S3_PUBLIC_URL = "https://study.storage.prohor.dev";

const s3Client = new S3Client({
  endpoint: S3_ENDPOINT,
  region: S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true,
});

const imageCache = new Map<string, string>();

async function migrateImagesInText(html: string): Promise<string> {
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

      const res = await fetch(fullUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
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
          })
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
```

---

## 4. Complete Question Ingestion & Re-sync Script Template

Run this script with `bun -e '...'` inside `apps/api/`:

```typescript
import { eq, inArray } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { db } from "./src/db";
import {
  qbExamSheets,
  qbExamSheetQuestions,
  qbQuestions,
  qbQuestionOptions,
  qbQuestionChapters,
  qbQuestionSources,
  qbChapterSources,
  qbSources,
  qbTopics,
  qbChapters,
} from "./src/db/schema";
import { recalculateAllCounts } from "./src/services/qb-count.service";

async function ingestExamSheet({
  chorchaExamId,
  sheetSlug,
  sourceSlug,
  sourceName,
  institution,
  unit,
  year,
  durationMinutes = 80,
}: {
  chorchaExamId: string;
  sheetSlug: string;
  sourceSlug: string;
  sourceName: string;
  institution: string;
  unit: string;
  year: number;
  durationMinutes?: number;
}) {
  const CHORCHA_TOKEN = process.env.CHORCHA_TOKEN;
  console.log(`Fetching exam ${chorchaExamId} from Chorcha...`);

  const res = await fetch(`https://api.chorcha.net/read/${chorchaExamId}`, {
    headers: { Authorization: `Bearer ${CHORCHA_TOKEN}` },
  });
  const key = res.headers.get("x-chorcha-id");
  const json = await res.json();
  const qList = json.data?.questions || [];
  console.log(`Fetched ${qList.length} questions from Chorcha.`);

  const [examSheet] = await db.select().from(qbExamSheets).where(eq(qbExamSheets.slug, sheetSlug));
  if (!examSheet) throw new Error(`Exam sheet ${sheetSlug} not found in database!`);

  const allTopics = await db.select().from(qbTopics);
  const allChapters = await db.select().from(qbChapters);
  const topicSlugMap = new Map(allTopics.map((t) => [t.slug, t]));
  const topicIdMap = new Map(allTopics.map((t) => [t.id, t]));
  const chapterIdMap = new Map(allChapters.map((c) => [c.id, c]));
  const chapterSlugMap = new Map(allChapters.map((c) => [c.slug, c]));

  function getChapterForTopic(topicId: string) {
    let curr = topicIdMap.get(topicId);
    while (curr) {
      if (curr.parentId) {
        if (chapterIdMap.has(curr.parentId)) return curr.parentId;
        curr = topicIdMap.get(curr.parentId);
      } else break;
    }
    return null;
  }

  // 1. Ensure source exists
  let [source] = await db.select().from(qbSources).where(eq(qbSources.slug, sourceSlug));
  if (!source) {
    [source] = await db
      .insert(qbSources)
      .values({
        id: uuidv7(),
        sourceGroup: "admission",
        type: "university",
        name: sourceName,
        slug: sourceSlug,
        institution,
        unit,
        year,
        questionCount: qList.length,
      })
      .returning();
  }

  // 2. Clean up previous questions attached to the sheet
  const existingSheetQuestions = await db
    .select({ questionId: qbExamSheetQuestions.questionId })
    .from(qbExamSheetQuestions)
    .where(eq(qbExamSheetQuestions.examSheetId, examSheet.id));

  const qIdsToDelete = existingSheetQuestions.map((esq) => esq.questionId);
  if (qIdsToDelete.length > 0) {
    console.log(`Cleaning up ${qIdsToDelete.length} existing questions in exam sheet...`);
    await db.delete(qbExamSheetQuestions).where(eq(qbExamSheetQuestions.examSheetId, examSheet.id));
    await db.delete(qbQuestionOptions).where(inArray(qbQuestionOptions.questionId, qIdsToDelete));
    await db.delete(qbQuestionChapters).where(inArray(qbQuestionChapters.questionId, qIdsToDelete));
    await db.delete(qbQuestionSources).where(inArray(qbQuestionSources.questionId, qIdsToDelete));
    await db.delete(qbQuestions).where(inArray(qbQuestions.id, qIdsToDelete));
    console.log("Old questions cleaned up.");
  }

  const findChap = (kw: string) => allChapters.find((c) => c.name.toLowerCase().includes(kw.toLowerCase()));
  const findTop = (kw: string) => allTopics.find((t) => t.name.toLowerCase().includes(kw.toLowerCase()));

  // 3. Insert fresh decrypted questions & migrate images
  for (let qIdx = 0; qIdx < qList.length; qIdx++) {
    const q = qList[qIdx];
    const qId = uuidv7();

    const decQ = decodeChorcha(q.question, key);
    const decSol = cleanSolutionText(decodeChorcha(q.solution, key));
    const decA = (decodeChorcha(q.A, key) || "").trim();
    const decB = (decodeChorcha(q.B, key) || "").trim();
    const decC = (decodeChorcha(q.C, key) || "").trim();
    const decD = (decodeChorcha(q.D, key) || "").trim();

    const cleanQuestion = await migrateImagesInText(decQ);
    const cleanSolution = decSol ? await migrateImagesInText(decSol) : null;

    let assignedTopicId: string | null = null;
    let assignedChapterId: string | null = null;

    if (q.topic) {
      const cleanTopicSlug = q.topic.replace(/_HSC-eng$/i, "");
      if (topicSlugMap.has(q.topic)) {
        const t = topicSlugMap.get(q.topic)!;
        assignedTopicId = t.id;
        assignedChapterId = getChapterForTopic(t.id);
      } else if (topicSlugMap.has(cleanTopicSlug)) {
        const t = topicSlugMap.get(cleanTopicSlug)!;
        assignedTopicId = t.id;
        assignedChapterId = getChapterForTopic(t.id);
      } else if (chapterSlugMap.has(q.topic)) {
        assignedChapterId = chapterSlugMap.get(q.topic)!.id;
      } else if (chapterSlugMap.has(cleanTopicSlug)) {
        assignedChapterId = chapterSlugMap.get(cleanTopicSlug)!.id;
      }
    }

    // Heuristic fallback for topic-less admission questions
    if (!assignedChapterId || !assignedTopicId) {
      const text = cleanQuestion.toLowerCase();
      if (
        text.includes("sentence") ||
        text.includes("word") ||
        text.includes("meaning") ||
        text.includes("passive") ||
        text.includes("voice") ||
        text.includes("preposition") ||
        text.includes("synonym") ||
        text.includes("antonym")
      ) {
        assignedChapterId = assignedChapterId || findChap("Grammar")?.id || findChap("Reading")?.id;
        assignedTopicId = assignedTopicId || findTop("Preposition")?.id || findTop("Vocabulary")?.id;
      } else if (text.includes("অর্ধপরিবাহী") || text.includes("ডায়োড") || text.includes("ট্রানজিস্টর")) {
        assignedChapterId = assignedChapterId || findChap("সেমিকন্ডাক্টর")?.id;
        assignedTopicId = assignedTopicId || findTop("অর্ধপরিবাহী")?.id;
      } else if (text.includes("কোষ") || text.includes("মায়োসিস") || text.includes("মাইটোসিস")) {
        assignedChapterId = assignedChapterId || findChap("কোষ বিভাজন")?.id || findChap("কোষ ও এর গঠন")?.id;
        assignedTopicId = assignedTopicId || findTop("কোষ")?.id;
      } else if (text.includes("জৈব") || text.includes("হাইড্রোকার্বন") || text.includes("অ্যালকিন")) {
        assignedChapterId = assignedChapterId || findChap("জৈব রসায়ন")?.id;
        assignedTopicId = assignedTopicId || findTop("অ্যালকোহল")?.id;
      } else {
        assignedChapterId = assignedChapterId || findChap("ভৌত জগৎ")?.id || allChapters[0].id;
        assignedTopicId = assignedTopicId || findTop("পরিমাপ")?.id || allTopics[0].id;
      }
    }

    await db.insert(qbQuestions).values({
      id: qId,
      topicId: assignedTopicId,
      qType: "mcq",
      questionText: cleanQuestion,
      explanation: cleanSolution,
      orderIndex: qIdx + 1,
      status: "published",
    });

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

    if (assignedChapterId) {
      await db.insert(qbQuestionChapters).values({ questionId: qId, chapterId: assignedChapterId }).onConflictDoNothing();
      await db.insert(qbChapterSources).values({ chapterId: assignedChapterId, sourceId: source.id }).onConflictDoNothing();
    }

    await db.insert(qbExamSheetQuestions).values({
      examSheetId: examSheet.id,
      questionId: qId,
      questionNumber: qIdx + 1,
    });

    await db.insert(qbQuestionSources).values({
      questionId: qId,
      sourceId: source.id,
    }).onConflictDoNothing();
  }

  // 4. Update Exam Sheet Metadata
  await db
    .update(qbExamSheets)
    .set({
      questionCount: qList.length,
      totalMarks: String(qList.length),
      durationMinutes,
    })
    .where(eq(qbExamSheets.id, examSheet.id));

  console.log(`Ingested ${qList.length} questions successfully.`);
  console.log("Recalculating QB aggregate counts...");
  await recalculateAllCounts();
  console.log("Done!");
}
```

---

## 5. Standardizing Naming & Slugs Across the DB

To keep the platform clean and consistent:

### Convention
- **Exam Sheet Title:** `<Varsity> <Unit> <Session>` (e.g. `BUP FST 23-24`, `JU A 23-24`, `DU A 23-24`)
- **Exam Sheet Slug:** `<containerSlug>-<unitSlug>-<session>` (e.g. `bup-fst-bup-fst-23-24`)
- **Source Name:** `<Varsity> <Unit> <Session>` (e.g. `BUP FST 23-24`)
- **Source Slug:** `<varsity>-<unit>-<session>` (e.g. `bup-fst-23-24`)
- **Source Year:** 4-digit start year integer (`2023`)
- **Source Institution:** Full official name (e.g. `Bangladesh University of Professionals (BUP)`)
- **Source Unit:** Full unit name (e.g. `Faculty of Science and Technology (FST)`)

### Standardizing Script
```typescript
import { eq, ilike } from "drizzle-orm";
import { db } from "./src/db";
import { qbExamSheets, qbSources } from "./src/db/schema";
import { recalculateAllCounts } from "./src/services/qb-count.service";

// Order sessions descending
const sessions = ["25-26", "24-25", "23-24", "22-23", "21-22", "20-21", "19-20", "18-19", "17-18"];

for (let i = 0; i < sessions.length; i++) {
  const sess = sessions[i];
  const startYear = 2000 + parseInt(sess.split("-")[0], 10);

  // Update Exam Sheets
  await db
    .update(qbExamSheets)
    .set({
      title: `BUP FST ${sess}`,
      slug: `bup-fst-bup-fst-${sess}`,
      orderIndex: i + 1,
    })
    .where(ilike(qbExamSheets.slug, `%bup-fst%${sess}%`));

  // Update Sources
  await db
    .update(qbSources)
    .set({
      name: `BUP FST ${sess}`,
      slug: `bup-fst-${sess}`,
      year: startYear,
      institution: "Bangladesh University of Professionals (BUP)",
      unit: "Faculty of Science and Technology (FST)",
      sourceGroup: "admission",
      type: "university",
    })
    .where(ilike(qbSources.slug, `%bup%fst%${sess}%`));
}

await recalculateAllCounts();
```

---

## 6. Removing Unwanted "Practice Set" Exam Sheets

If generic / practice sets were generated during scraping and need to be removed **without deleting the questions**:

```typescript
import { eq } from "drizzle-orm";
import { db } from "./src/db";
import { qbExamSheets, qbExamSheetQuestions } from "./src/db/schema";
import { recalculateAllCounts } from "./src/services/qb-count.service";

const sheetSlug = "bup-fst-bup-fst-practice-set";
const [sheet] = await db.select().from(qbExamSheets).where(eq(qbExamSheets.slug, sheetSlug));

if (sheet) {
  // 1. Unlink exam sheet questions (keeps questions in qb_questions and topics intact)
  await db.delete(qbExamSheetQuestions).where(eq(qbExamSheetQuestions.examSheetId, sheet.id));
  // 2. Delete the exam sheet entry
  await db.delete(qbExamSheets).where(eq(qbExamSheets.id, sheet.id));
  // 3. Recalculate counts
  await recalculateAllCounts();
}
```

---

## 7. Verifying Consistency

Always run a check after any modification:

```typescript
import { db } from "./src/db";
import { qbExamSheets, qbSources } from "./src/db/schema";
import { eq, ilike } from "drizzle-orm";

const sheets = await db.select().from(qbExamSheets).where(ilike(qbExamSheets.slug, "bup-fst-%"));
const sources = await db.select().from(qbSources).where(ilike(qbSources.slug, "bup-fst-%"));

console.table(sheets.sort((a, b) => a.orderIndex - b.orderIndex).map(s => ({
  title: s.title,
  slug: s.slug,
  questions: s.questionCount,
  duration: s.durationMinutes,
  order: s.orderIndex
})));

console.table(sources.sort((a, b) => b.year - a.year).map(s => ({
  name: s.name,
  slug: s.slug,
  year: s.year,
  questions: s.questionCount
})));
```
