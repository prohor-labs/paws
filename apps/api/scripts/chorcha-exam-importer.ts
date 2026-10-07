import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { eq, inArray } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { db } from "../src/db";
import {
  qbChapters,
  qbChapterSources,
  qbContainerItems,
  qbContainers,
  qbExamSheetQuestions,
  qbExamSheets,
  qbQuestionChapters,
  qbQuestionOptions,
  qbQuestionParts,
  qbQuestionSources,
  qbQuestions,
  qbSources,
  qbTargets,
  qbTopics,
} from "../src/db/schema";
import { recalculateAllCounts } from "../src/services/qb-count.service";

const CHORCHA_TOKEN = process.env.CHORCHA_TOKEN;
const S3_ENDPOINT = process.env.AWS_ENDPOINT_URL_S3 || process.env.AWS_ENDPOINT || "https://s3.prohor.dev";
const S3_BUCKET = process.env.S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME || "study";
const S3_REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "garage";
const S3_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID || "";
const S3_SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY || "";
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

export function decodeChorcha(text: string | null | undefined, key: string | null): string {
  if (!text || !key) return text || "";
  const chars: string[] = [];
  for (let i = 0; i < text.length; i++) {
    const diff = (text.charCodeAt(i) - key.charCodeAt(i % 16)) & 0xffff;
    chars.push(String.fromCharCode(diff));
  }
  return chars.join("").replace(/\0/g, "");
}

export function sanitizeRichText(text: string | null | undefined): string | null {
  if (!text) return null;
  let res = text.trim();
  if (!res || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\uFFFD\uFFF0-\uFFFF]/.test(res)) {
    return null;
  }

  // 0. Convert images to markdown syntax: <img src="..."> -> ![](...)
  res = res.replace(/<img[^>]+src=["\']([^"\']+)["\'][^>]*\/?>/gi, "![]($1)");

  // 1. Remove wrapping <p>...</p> and empty paragraphs
  res = res.replace(/^(<p>\s*<\/p>|<p><br\/?>\s*<\/p>|\s)+/gi, "");
  res = res.replace(/(<p>\s*<\/p>|<p><br\/?>\s*<\/p>|\s)+$/gi, "");
  res = res.replace(/<\/?p[^>]*>/gi, "\n\n");
  res = res.replace(/<br\s*\/?>/gi, "\n");
  res = res.replace(/<\/?(div|span|strong|b|em|i)[^>]*>/gi, "");

  // 2. Convert LaTeX delimiter variants
  // \( ... \) -> $ ... $
  res = res.replace(/\\\(\s*([\s\S]*?)\s*\\\)/g, "$$$1$$");
  // \[ ... \] -> $$ ... $$
  res = res.replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, "\n\n$$$$$1$$$$\n\n");

  // 3. Normalize multiple whitespace and clean
  res = res.replace(/\n{3,}/g, "\n\n").trim();
  return res || null;
}

export function cleanSolutionText(text: string | null | undefined): string | null {
  return sanitizeRichText(text);
}

const imageCache = new Map<string, string>();

export async function migrateImagesInText(html: string): Promise<string> {
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

export async function fetchChorchaExam(examId: string) {
  const url = `https://api.chorcha.net/read/${examId}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${CHORCHA_TOKEN}`,
      "User-Agent": "Mozilla/5.0",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Chorcha exam ${examId}: ${res.status} ${res.statusText}`);
  }

  const key = res.headers.get("x-chorcha-id");
  const json: any = await res.json();
  const rawQuestions = json.data?.questions || [];

  const decodedQuestions = [];
  for (let i = 0; i < rawQuestions.length; i++) {
    const q = rawQuestions[i];
    const decQ = decodeChorcha(q.question, key);
    const decA = decodeChorcha(q.A, key);
    const decB = decodeChorcha(q.B, key);
    const decC = decodeChorcha(q.C, key);
    const decD = decodeChorcha(q.D, key);
    const decSol = cleanSolutionText(decodeChorcha(q.solution, key));

    const cleanQ = sanitizeRichText(await migrateImagesInText(decQ)) || "";
    const cleanA = sanitizeRichText(await migrateImagesInText(decA)) || "";
    const cleanB = sanitizeRichText(await migrateImagesInText(decB)) || "";
    const cleanC = sanitizeRichText(await migrateImagesInText(decC)) || "";
    const cleanD = sanitizeRichText(await migrateImagesInText(decD)) || "";

    decodedQuestions.push({
      index: i + 1,
      rawId: q._id,
      questionText: cleanQ,
      options: [
        { key: "A", text: cleanA, orderIndex: 1 },
        { key: "B", text: cleanB, orderIndex: 2 },
        { key: "C", text: cleanC, orderIndex: 3 },
        { key: "D", text: cleanD, orderIndex: 4 },
      ].filter((o) => o.text && o.text.trim().length > 0),
      answer: (q.answer || "").trim(),
      explanation: decSol ? await migrateImagesInText(decSol) : null,
      topic: q.topic || null,
      subject: q.subject || null,
      tags: q.tags || q.tag || null,
    });
  }

  return { examId, questions: decodedQuestions };
}

export async function importExamQuestionsToDb({
  sheetSlug,
  sourceSlug,
  sourceName,
  institution,
  unit,
  year,
  questions,
  durationMinutes = 80,
}: {
  sheetSlug: string;
  sourceSlug: string;
  sourceName: string;
  institution: string;
  unit: string;
  year: number;
  questions: Array<{
    index: number;
    questionText: string;
    options: Array<{ key: string; text: string; orderIndex: number }>;
    answer: string;
    explanation?: string | null;
    topic?: string | null;
    chapter?: string | null;
    sources?: string[] | string | null;
    tags?: string[] | string | null;
  }>;
  durationMinutes?: number;
}) {
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

  // 1. Source
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
        questionCount: questions.length,
      })
      .returning();
  }

  const allSources = await db.select().from(qbSources);
  const sourceSlugMap = new Map(allSources.map((s) => [s.slug.toLowerCase(), s]));
  const sourceNameMap = new Map(allSources.map((s) => [s.name.trim().toLowerCase(), s]));

  async function resolveSourceId(tagOrName: string): Promise<string> {
    const raw = tagOrName.trim();
    if (!raw) return source.id;
    const cleanSlug = raw.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const lowerName = raw.toLowerCase();

    if (sourceSlugMap.has(cleanSlug)) return sourceSlugMap.get(cleanSlug)!.id;
    if (sourceNameMap.has(lowerName)) return sourceNameMap.get(lowerName)!.id;

    const matched = allSources.find(
      (s) =>
        s.slug.toLowerCase() === cleanSlug ||
        s.name.toLowerCase() === lowerName ||
        s.name.toLowerCase().includes(lowerName) ||
        lowerName.includes(s.name.toLowerCase())
    );
    if (matched) return matched.id;

    // Parse year if present
    const yearMatch = raw.match(/(\d{4})|(\d{2})[-–](\d{2})/);
    let inferredYear = year;
    if (yearMatch) {
      if (yearMatch[1]) inferredYear = parseInt(yearMatch[1]);
      else if (yearMatch[2]) {
        const y = parseInt(yearMatch[2]);
        inferredYear = y >= 50 ? 1900 + y : 2000 + y;
      }
    }

    let inferredInst = institution;
    if (/DU/i.test(raw)) inferredInst = "University of Dhaka";
    else if (/JU/i.test(raw)) inferredInst = "Jahangirnagar University";
    else if (/RU/i.test(raw)) inferredInst = "Rajshahi University";
    else if (/CU/i.test(raw)) inferredInst = "University of Chittagong";
    else if (/BUP/i.test(raw)) inferredInst = "BUP";
    else if (/Medical|MATS/i.test(raw)) inferredInst = "Medical";

    const [newSource] = await db
      .insert(qbSources)
      .values({
        id: uuidv7(),
        sourceGroup: "admission",
        type: "university",
        name: raw,
        slug: cleanSlug || uuidv7(),
        institution: inferredInst,
        unit: unit || null,
        year: inferredYear,
        questionCount: 0,
      })
      .returning();

    allSources.push(newSource);
    sourceSlugMap.set(newSource.slug.toLowerCase(), newSource);
    sourceNameMap.set(newSource.name.toLowerCase(), newSource);
    return newSource.id;
  }

  // 2. Clean up previous questions attached to the sheet
  const existingSheetQuestions = await db
    .select({ questionId: qbExamSheetQuestions.questionId })
    .from(qbExamSheetQuestions)
    .where(eq(qbExamSheetQuestions.examSheetId, examSheet.id));

  const qIdsToDelete = existingSheetQuestions.map((esq) => esq.questionId);
  if (qIdsToDelete.length > 0) {
    await db.delete(qbExamSheetQuestions).where(eq(qbExamSheetQuestions.examSheetId, examSheet.id));
    await db.delete(qbQuestionOptions).where(inArray(qbQuestionOptions.questionId, qIdsToDelete));
    await db.delete(qbQuestionChapters).where(inArray(qbQuestionChapters.questionId, qIdsToDelete));
    await db.delete(qbQuestionSources).where(inArray(qbQuestionSources.questionId, qIdsToDelete));
    await db.delete(qbQuestions).where(inArray(qbQuestions.id, qIdsToDelete));
  }

  const findChap = (kw: string) => allChapters.find((c) => c.name.toLowerCase().includes(kw.toLowerCase()));
  const findTop = (kw: string) => allTopics.find((t) => t.name.toLowerCase().includes(kw.toLowerCase()));

  // 3. Insert questions in exact exam sequence
  for (const q of questions) {
    const qId = uuidv7();

    let assignedTopicId: string | null = null;
    let assignedChapterId: string | null = null;

    if (q.topic) {
      const cleanTopicSlug = q.topic.replace(/_HSC-eng$/i, "");
      // 1. Match by slug / hash
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

      // 2. Match by exact or partial topic / chapter name (from AI output).
      // Exact names always win: a partial match may hit a sibling topic whose
      // name merely contains the wanted string (e.g. "গতিশক্তি" matching
      // "গ্যাসের গতিশক্তি" first), which silently files the question under the
      // wrong chapter.
      const wanted = (q.topic ?? "").trim().toLowerCase();
      if (!assignedTopicId && wanted) {
        const matchedTopic =
          allTopics.find((t) => t.name.trim().toLowerCase() === wanted) ??
          allTopics.find((t) => t.name.toLowerCase().includes(wanted));
        if (matchedTopic) {
          assignedTopicId = matchedTopic.id;
          assignedChapterId = getChapterForTopic(matchedTopic.id);
        }
      }

      if (!assignedChapterId && wanted) {
        const matchedChap =
          allChapters.find((c) => c.name.trim().toLowerCase() === wanted) ??
          allChapters.find((c) => c.name.toLowerCase().includes(wanted));
        if (matchedChap) {
          assignedChapterId = matchedChap.id;
        }
      }
    }

    if (!assignedChapterId && q.chapter) {
      const wantedChap = q.chapter.trim().toLowerCase();
      const matchedChap =
        allChapters.find((c) => c.name.trim().toLowerCase() === wantedChap) ??
        allChapters.find((c) => c.name.toLowerCase().includes(wantedChap));
      if (matchedChap) {
        assignedChapterId = matchedChap.id;
      }
    }

    if (!assignedChapterId || !assignedTopicId) {
      const text = q.questionText.toLowerCase();
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
        assignedChapterId = assignedChapterId || findChap("Grammar")?.id || findChap("Reading")?.id || null;
        assignedTopicId = assignedTopicId || findTop("Preposition")?.id || findTop("Vocabulary")?.id || null;
      } else if (text.includes("অর্ধপরিবাহী") || text.includes("ডায়োড") || text.includes("ট্রানজিস্টর")) {
        assignedChapterId = assignedChapterId || findChap("সেমিকন্ডাক্টর")?.id || null;
        assignedTopicId = assignedTopicId || findTop("অর্ধপরিবাহী")?.id || null;
      } else if (text.includes("কোষ") || text.includes("মায়োসিস") || text.includes("মাইটোসিস")) {
        assignedChapterId = assignedChapterId || findChap("কোষ বিভাজন")?.id || findChap("কোষ ও এর গঠন")?.id || null;
        assignedTopicId = assignedTopicId || findTop("কোষ")?.id || null;
      } else if (text.includes("জৈব") || text.includes("হাইড্রোকার্বন") || text.includes("অ্যালকিন")) {
        assignedChapterId = assignedChapterId || findChap("জৈব রসায়ন")?.id || null;
        assignedTopicId = assignedTopicId || findTop("অ্যালকোহল")?.id || null;
      } else {
        assignedChapterId = assignedChapterId || findChap("ভৌত জগৎ")?.id || allChapters[0]?.id || null;
        assignedTopicId = assignedTopicId || findTop("পরিমাপ")?.id || allTopics[0]?.id || null;
      }
    }

    await db.insert(qbQuestions).values({
      id: qId,
      topicId: assignedTopicId,
      qType: "mcq",
      questionText: q.questionText,
      explanation: q.explanation || null,
      orderIndex: q.index,
      status: "published",
    });

    for (const opt of q.options) {
      await db.insert(qbQuestionOptions).values({
        id: uuidv7(),
        questionId: qId,
        optionText: opt.text,
        isCorrect: opt.key === q.answer,
        orderIndex: opt.orderIndex,
      });
    }

    const sourcesToLink = new Set<string>();
    sourcesToLink.add(source.id);

    const questionSourcesRaw = (q as any).sources || (q as any).tags;
    if (questionSourcesRaw) {
      const sourceList = Array.isArray(questionSourcesRaw)
        ? questionSourcesRaw
        : String(questionSourcesRaw)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
      for (const srcTag of sourceList) {
        if (srcTag) {
          const resolvedId = await resolveSourceId(srcTag);
          sourcesToLink.add(resolvedId);
        }
      }
    }

    if (assignedChapterId) {
      await db
        .insert(qbQuestionChapters)
        .values({ questionId: qId, chapterId: assignedChapterId })
        .onConflictDoNothing();
      for (const srcId of sourcesToLink) {
        await db
          .insert(qbChapterSources)
          .values({ chapterId: assignedChapterId, sourceId: srcId })
          .onConflictDoNothing();
      }
    }

    await db.insert(qbExamSheetQuestions).values({
      examSheetId: examSheet.id,
      questionId: qId,
      questionNumber: q.index,
    });

    for (const srcId of sourcesToLink) {
      await db
        .insert(qbQuestionSources)
        .values({
          questionId: qId,
          sourceId: srcId,
        })
        .onConflictDoNothing();
    }
  }

  // 4. Update Exam Sheet Metadata
  await db
    .update(qbExamSheets)
    .set({
      questionCount: questions.length,
      totalMarks: String(questions.length),
      durationMinutes,
    })
    .where(eq(qbExamSheets.id, examSheet.id));

  await recalculateAllCounts();
  console.log(`Successfully imported ${questions.length} questions into ${sheetSlug}.`);
}
