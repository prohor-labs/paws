import { existsSync, readFileSync } from "fs";

/**
 * Lightweight validator for AI-processed question batches.
 *
 * Usage:
 *   bun run scripts/validate-processed.ts --raw "/tmp/raw_questions.json" --in "/tmp/processed_questions.json"
 *
 * Checks (in order of importance):
 *  1. Every raw question has a processed counterpart at the same index.
 *  2. The answer key is present and matches the raw dump (missing keys previously defaulted every question to "A").
 *  3. Question stems / options were not materially rewritten (formatting-only changes allowed).
 *  4. Explanation, chapter and topic are present.
 *  5. No HTML tags, HTML entities, legacy LaTeX tokens or artificial section headers.
 *  6. Every wrong option has a distractor rationale line ("- (A) ...").
 *
 * Exits non-zero when any check fails so it can gate the import step.
 */

function canon(s: string): string {
  return s
    .normalize("NFC")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/[\u00A0\u200B\u200C\u200D]/g, " ")
    .replace(/<sup[^>]*>\s*o\s*<\/sup>/gi, "°")
    .replace(/<sub[^>]*>\s*(.*?)<\/sub>/gi, "$1")
    .replace(/<sup[^>]*>\s*(.*?)<\/sup>/gi, "$1")
    .replace(/<\/?(?:p|div|span|b|i|br|table|thead|tbody|tr|th|td|u)[^>]*>/gi, " ")
    .replace(/\|/g, " ")
    .replace(/\\text\{([^}]*)\}/g, "$1")
    .replace(/\\[()[\]]/g, "") // legacy math delimiters \( \) \[ \]
    .replace(/[²³¹⁴⁻]/g, (c) => ({ "²": "2", "³": "3", "¹": "1", "⁴": "4", "⁻": "-" }[c] || c))
    .replace(/[\\$%{}~_^\u00B0\u2212\u2013\u2014\-]/g, "") // ignore LaTeX escapes / math delimiters / braces / tildes / degree / minus / dashes
    .replace(/[\u09AF\u09DF]/g, "\u09AF")
    .replace(/\u09BC/g, "") // nukta variants
    .replace(/["\x27`.]/g, "")
    .replace(/\b[ABY]\b/g, "")
    .replace(/\s+/g, "")
    .trim();
}

function arg(name: string): string | null {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] ?? null : null;
}

const rawPath = arg("--raw");
const inPath = arg("--in");

if (!rawPath || !inPath) {
  console.log("Usage: bun run scripts/validate-processed.ts --raw <raw.json> --in <processed.json>");
  process.exit(1);
}
for (const p of [rawPath, inPath]) {
  if (!existsSync(p)) {
    console.error(`File not found: ${p}`);
    process.exit(1);
  }
}

const raw: any[] = JSON.parse(readFileSync(rawPath, "utf-8"));
const processed: any[] = JSON.parse(readFileSync(inPath, "utf-8"));
const byIndex = new Map<number, any>(processed.map((q) => [q.index, q]));

const errors: string[] = [];
if (processed.length !== raw.length) {
  errors.push(`count mismatch: processed ${processed.length} vs raw ${raw.length}`);
}

for (const r of raw) {
  const p = byIndex.get(r.index);
  if (!p) {
    errors.push(`Q${r.index}: missing from processed output`);
    continue;
  }

  if (canon(p.questionText ?? "") !== canon(r.questionText ?? "")) {
    errors.push(`Q${r.index}: stem text materially changed`);
  }
  if ((p.options?.length ?? 0) !== r.options.length) {
    errors.push(`Q${r.index}: option count changed`);
  }
  r.options.forEach((o: any, i: number) => {
    if (p.options?.[i]?.key !== o.key) errors.push(`Q${r.index}: option key changed at ${i}`);
    if (canon(p.options?.[i]?.text ?? "") !== canon(o.text)) {
      errors.push(`Q${r.index}: option ${o.key} materially changed`);
    }
  });

  const expectedAnswer = r.options.find((o: any) => o.isCorrect)?.key;
  if (!p.answer?.trim()) {
    errors.push(`Q${r.index}: missing answer key`);
  } else if (expectedAnswer && p.answer !== expectedAnswer) {
    errors.push(`Q${r.index}: answer key ${p.answer} does not match source ${expectedAnswer}`);
  }

  if (!p.explanation?.trim()) errors.push(`Q${r.index}: empty explanation`);
  if (!p.chapter?.trim() || !p.topic?.trim()) errors.push(`Q${r.index}: missing chapter/topic`);
  if (Array.isArray(r.sources) && r.sources.length > 0) {
    if (!Array.isArray(p.sources) || p.sources.length === 0) {
      errors.push(`Q${r.index}: missing sources array in processed question`);
    }
  }

  const blob = JSON.stringify(p);
  if (/<(p|div|br|span|sup|sub|b|i|table)[ >]/i.test(blob)) errors.push(`Q${r.index}: raw HTML tag`);
  if (/&(gt|lt|amp|nbsp);/.test(blob)) errors.push(`Q${r.index}: HTML entity`);
  if (/\\\(|\\\[|\[imath\]/.test(blob)) errors.push(`Q${r.index}: legacy LaTeX token`);
  if (/\*\*(ব্যাখ্যা|সঠিক উত্তর|শর্টকাট|অন্যান্য|অ্যাডমিশন)/.test(blob)) {
    errors.push(`Q${r.index}: artificial section header`);
  }
  if (/[\u0900-\u0963\u0966-\u097F\u4E00-\u9FFF]/.test(blob)) errors.push(`Q${r.index}: foreign-script junk`);

  for (const o of r.options) {
    if (o.isCorrect) continue;
    if (!p.explanation?.includes(`- (${o.key})`)) {
      errors.push(`Q${r.index}: missing distractor rationale for ${o.key}`);
    }
  }
}

console.log(`Validated ${processed.length} processed questions against ${raw.length} raw questions.`);
if (errors.length) {
  console.error(`✗ ${errors.length} issue(s):`);
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}
console.log("✓ All checks passed.");
