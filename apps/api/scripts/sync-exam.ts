import { readFileSync, writeFileSync } from "fs";
import { eq, inArray, like } from "drizzle-orm";
import { db } from "../src/db";
import { qbExamSheets } from "../src/db/schema";
import { fetchChorchaExam, importExamQuestionsToDb } from "./chorcha-exam-importer";

/**
 * Universal Chorcha Exam Synchronizer & AI Pipeline Bridge
 *
 * Supports:
 * 1. Dump raw questions from Chorcha URL or Exam ID:
 *    bun run scripts/sync-exam.ts --dump --chorcha "https://chorcha.net/read/jp-Wlpg4y_TNk0Zy" --out "/tmp/raw.json"
 *
 * 2. Import AI-processed questions directly to target sheet URL:
 *    bun run scripts/sync-exam.ts --import --target "https://pawfessor.vercel.app/qb/general/varsity-bup/bup-fst/bup-fst-bup-fst-25-26" --in "/tmp/processed.json"
 *
 * 3. Inspect / probe bundle URLs:
 *    bun run scripts/sync-exam.ts --url "https://chorcha.net/question-bank/FDWBEs"
 */

export function extractExamIdFromUrl(urlOrId: string): string {
  const trimmed = urlOrId.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const parts = trimmed.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    return last;
  }
  return trimmed;
}

export function extractSheetSlugFromUrl(urlOrSlug: string): string {
  const trimmed = urlOrSlug.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const parts = trimmed.split("/").filter(Boolean);
    return parts[parts.length - 1];
  }
  return trimmed;
}

interface ExamMetadata {
  id: string;
  name: string;
  qCount?: number;
  duration?: number;
}

interface UnitMetadata {
  id: string;
  name: string;
  slug: string;
}

export async function extractExamsFromPage(url: string): Promise<ExamMetadata[]> {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`Failed to load page: ${url} (${res.status})`);
  const html = await res.text();

  const regex = /\\\\\"_id\\\\\":\\\\\"([a-zA-Z0-9_-]{16})\\\\\",\\\\\"free\\\\\":\\\\\"[^\"]+\\\\\",\\\\\"name\\\\\":\\\\\"([^\\\\]+)\\\\\"/g;
  let m: RegExpExecArray | null;
  const exams: ExamMetadata[] = [];
  while ((m = regex.exec(html)) !== null) {
    exams.push({ id: m[1], name: m[2] });
  }
  return exams;
}

export async function extractUnitsFromBundle(url: string): Promise<UnitMetadata[]> {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`Failed to load page: ${url} (${res.status})`);
  const html = await res.text();

  const regex = /\\\\\"_id\\\\\":\\\\\"([a-zA-Z0-9_-]{10})\\\\\",\\\\\"logo\\\\\":[^,]+,\\\\\"name\\\\\":\\\\\"([^\\\\]+)\\\\\",\\\\\"slug\\\\\":\\\\\"([^\\\\]+)\\\\\"/g;
  let m: RegExpExecArray | null;
  const units: UnitMetadata[] = [];
  while ((m = regex.exec(html)) !== null) {
    units.push({ id: m[1], name: m[2], slug: m[3] });
  }
  return units;
}

function parseYearAndUnitFromName(name: string): { year: number; unit: string; yearSlug: string } {
  const yearMatch = name.match(/(\d{4})[-–](\d{2,4})|(\d{2})[-–](\d{2})/);
  let year = 2025;
  let yearSlug = "25-26";
  if (yearMatch) {
    if (yearMatch[1]) {
      const y1 = parseInt(yearMatch[1]);
      const y2 = parseInt(yearMatch[2]);
      year = y1;
      yearSlug = `${String(y1).slice(-2)}-${String(y2).slice(-2)}`;
    } else if (yearMatch[3]) {
      const y1 = parseInt(yearMatch[3]);
      const y2 = parseInt(yearMatch[4]);
      year = y1 >= 50 ? 1900 + y1 : 2000 + y1;
      yearSlug = `${y1}-${y2}`;
    }
  }

  let unit = "FST";
  if (/FASS/i.test(name)) unit = "FASS";
  else if (/FSSS/i.test(name)) unit = "FSSS";
  else if (/FBS/i.test(name)) unit = "FBS";
  else if (/FST/i.test(name)) unit = "FST";

  return { year, unit, yearSlug };
}

async function dumpExamQuestions(chorchaUrlOrId: string, outputPath: string) {
  const examId = extractExamIdFromUrl(chorchaUrlOrId);
  console.log(`\n==========================================================`);
  console.log(`📥 Dumping Raw Questions for Exam ID: ${examId}`);
  console.log(`==========================================================`);

  const fetched = await fetchChorchaExam(examId);
  console.log(`✓ Fetched & decrypted ${fetched.questions.length} questions from Chorcha.`);

  const exportPayload = fetched.questions.map((q) => {
    const rawTags = (q as any).tags || (q as any).tag || "";
    const sources = rawTags
      ? String(rawTags)
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
      : [];
    return {
      index: q.index,
      questionText: q.questionText,
      options: q.options.map((o) => ({
        key: o.key,
        text: o.text,
        isCorrect: o.key === q.answer,
      })),
      existingExplanation: q.explanation,
      topicHint: q.topic || q.subject || null,
      sources,
    };
  });

  writeFileSync(outputPath, JSON.stringify(exportPayload, null, 2), "utf-8");
  console.log(`✨ Successfully wrote ${exportPayload.length} raw questions to ${outputPath}`);
  console.log(`Next Step: Pass batches from ${outputPath} into the AI Prompt in prompt.md.`);
}

async function importProcessedQuestions(targetSheetUrlOrSlug: string, inputPath: string) {
  const sheetSlug = extractSheetSlugFromUrl(targetSheetUrlOrSlug);
  console.log(`\n==========================================================`);
  console.log(`🚀 Importing AI-Processed Questions to Sheet: ${sheetSlug}`);
  console.log(`==========================================================`);

  const fileData = readFileSync(inputPath, "utf-8");
  const processedQuestions = JSON.parse(fileData);

  if (!Array.isArray(processedQuestions) || processedQuestions.length === 0) {
    throw new Error(`Invalid or empty array in ${inputPath}`);
  }

  const { unit, year } = parseYearAndUnitFromName(sheetSlug);
  const sourceSlug = `bup-${unit.toLowerCase()}-${sheetSlug.split("-").slice(-2).join("-")}`;
  const sourceName = `BUP ${unit} Admission ${year}`;

  const formattedForImport = processedQuestions.map((q: any) => {
    // The answer key may arrive either as an explicit `answer` letter on the
    // question or as `isCorrect: true` on an option. Never guess: a missing
    // key would silently mark option A correct on every question.
    const correctOpt = (q.options || []).find((o: any) => o.isCorrect === true);
    const answerKey = correctOpt ? correctOpt.key : String(q.answer || "").trim().toUpperCase();

    if (!["A", "B", "C", "D"].includes(answerKey)) {
      throw new Error(
        `Question #${q.index} has no usable answer key (got ${JSON.stringify(q.answer)}). ` +
          `Expected an \`answer\` letter A-D or an option with isCorrect: true.`
      );
    }

    const rawSources = (q as any).sources || (q as any).tags || [];
    const sourcesList = Array.isArray(rawSources)
      ? rawSources
      : String(rawSources)
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);

    return {
      index: q.index,
      questionText: q.questionText,
      options: q.options.map((o: any, idx: number) => ({
        key: o.key || "ABCD"[idx],
        text: o.text,
        orderIndex: idx + 1,
      })),
      answer: answerKey,
      explanation: q.explanation || null,
      topic: q.topic || null,
      chapter: q.chapter || null,
      sources: sourcesList,
    };
  });

  await importExamQuestionsToDb({
    sheetSlug,
    sourceSlug,
    sourceName,
    institution: "BUP",
    unit,
    year,
    questions: formattedForImport,
  });

  console.log(`✨ Successfully imported ${formattedForImport.length} questions into ${sheetSlug}.`);
}

async function main() {
  const args = process.argv.slice(2);

  const isDump = args.includes("--dump");
  const isImport = args.includes("--import");
  const chorchaIdx = args.indexOf("--chorcha");
  const outIdx = args.indexOf("--out");
  const targetIdx = args.indexOf("--target");
  const inIdx = args.indexOf("--in");
  const urlArgIdx = args.indexOf("--url");

  if (isDump && chorchaIdx !== -1 && outIdx !== -1) {
    const chorchaInput = args[chorchaIdx + 1];
    const outPath = args[outIdx + 1];
    await dumpExamQuestions(chorchaInput, outPath);
    process.exit(0);
  }

  if (isImport && targetIdx !== -1 && inIdx !== -1) {
    const targetInput = args[targetIdx + 1];
    const inPath = args[inIdx + 1];
    await importProcessedQuestions(targetInput, inPath);
    process.exit(0);
  }

  if (urlArgIdx !== -1 && args[urlArgIdx + 1]) {
    const url = args[urlArgIdx + 1];
    console.log(`🔎 Analyzing URL: ${url}`);

    if (url.includes("/FDWBEs") || url.endsWith("FDWBEs")) {
      const units = await extractUnitsFromBundle(url);
      console.log(`Found ${units.length} units in bundle:`, units.map((u) => u.name));
    } else {
      const exams = await extractExamsFromPage(url);
      console.log(`Found ${exams.length} exams on page:`);
      exams.forEach((e) => console.log(`  ${e.id} -> ${e.name}`));
    }
    process.exit(0);
  }

  console.log(`Usage:`);
  console.log(`  1. Dump raw questions from Chorcha URL:`);
  console.log(`     bun run scripts/sync-exam.ts --dump --chorcha <chorchaUrlOrId> --out <outputPath>`);
  console.log(`\n  2. Import AI-processed questions directly to Pawfessor sheet URL:`);
  console.log(`     bun run scripts/sync-exam.ts --import --target <targetSheetUrl> --in <inputPath>`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
