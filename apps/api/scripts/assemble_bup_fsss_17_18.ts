import { readFileSync, writeFileSync } from "fs";
import { b1 } from "./bup_fsss_17_18_b1";
import { b2 } from "./bup_fsss_17_18_b2";
import { b3 } from "./bup_fsss_17_18_b3";
import { b4 } from "./bup_fsss_17_18_b4";
import { b5 } from "./bup_fsss_17_18_b5";

const raw = JSON.parse(readFileSync("/tmp/raw_bup_fsss_17_18.json", "utf-8"));
const all = { ...b1, ...b2, ...b3, ...b4, ...b5 };

function cleanHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/<sup[^>]*>\s*(.*?)\s*<\/sup>/gi, "^$1")
    .replace(/<sub[^>]*>\s*(.*?)\s*<\/sub>/gi, "_$1")
    .replace(/<\/?(?:u|b|i|span|p|div|br)[^>]*>/gi, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/[\u00A0\u200B\u200C\u200D]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const processed = raw.map((q: any) => {
  const data = all[q.index as keyof typeof all];
  if (!data) {
    throw new Error(`Missing data for Q${q.index}`);
  }

  const ans = q.options.find((o: any) => o.isCorrect)?.key;
  if (!ans) {
    throw new Error(`Missing answer for Q${q.index}`);
  }

  return {
    index: q.index,
    questionText: cleanHtml(q.questionText),
    options: q.options.map((o: any) => ({
      key: o.key,
      text: cleanHtml(o.text),
    })),
    answer: ans,
    explanation: data.explanation.trim(),
    chapter: data.chapter.trim(),
    topic: data.topic.trim(),
    sources: q.sources ?? [],
  };
});

writeFileSync("/tmp/processed_bup_fsss_17_18.json", JSON.stringify(processed, null, 2), "utf-8");
console.log(`Successfully assembled ${processed.length} questions to /tmp/processed_bup_fsss_17_18.json`);
