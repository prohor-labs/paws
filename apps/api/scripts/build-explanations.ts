import { readFileSync, writeFileSync } from "fs";

const raw = JSON.parse(readFileSync("/tmp/raw_questions.json", "utf-8"));
const taxonomy = JSON.parse(readFileSync("scripts/taxonomy-dump.json", "utf-8"));

const chById = new Map(taxonomy.chapters.map((c: any) => [c.id, c]));
const tById = new Map(taxonomy.topics.map((t: any) => [t.id, t]));
const tBySlug = new Map(taxonomy.topics.map((t: any) => [t.slug, t]));

function resolve(slug: string | null) {
  if (!slug) return null;
  let curr = tBySlug.get(slug);
  if (!curr) return null;
  const topicName = curr.name;
  while (curr && curr.parentId) {
    if (chById.has(curr.parentId)) {
      return { topic: topicName, chapter: chById.get(curr.parentId).name };
    }
    curr = tById.get(curr.parentId);
  }
  return { topic: topicName, chapter: null };
}

const unmapped: Record<number, { chapter: string; topic: string }> = {
  2: { chapter: "Parts of Speech & Identification", topic: "Group Verbs / Phrasal Verbs" },
  3: { chapter: "বৃত্ত", topic: "বৃত্তের সমীকরণ" },
  4: { chapter: "Preposition & Appropriate Preposition", topic: "Appropriate Preposition" },
  5: { chapter: "Sentence Correction & Transformation", topic: "Sentence Correction" },
  15: { chapter: "Spelling & Vocabulary Usage", topic: "Vocabulary" },
  16: { chapter: "Spelling & Vocabulary Usage", topic: "Vocabulary" },
  18: { chapter: "ম্যাট্রিক্স ও নির্ণায়ক", topic: "বিপরীত ম্যাট্রিক্স" },
  21: { chapter: "তরঙ্গ", topic: "শব্দের বেগ" },
  30: { chapter: "Sentence Correction & Transformation", topic: "Narration" },
  33: { chapter: "English ", topic: "Reading Comprehension " },
  34: { chapter: "চল তড়িৎ", topic: "বিদ্যুৎ বিল " },
  39: { chapter: "সরলরেখা", topic: "সরলরেখার সমীকরণ" },
  43: { chapter: "Parts of Speech & Identification", topic: "Modal Auxiliaries" },
  52: { chapter: "চল তড়িৎ", topic: "তড়িৎ প্রবাহ ও বর্তনী" },
  53: { chapter: "বহুপদী ও বহুপদী সমীকরণ", topic: "দ্বিঘাত ও ত্রিঘাত সমীকরণ সংক্রান্ত" },
  55: { chapter: "সরলরেখা", topic: "বিন্দুত্রয়ের সমরেখ হওয়ার শর্ত" },
  63: { chapter: "Spelling & Vocabulary Usage", topic: "One Word Substitution" },
  64: { chapter: "English ", topic: "English Literature" },
  66: { chapter: "রাসায়নিক পরিবর্তন", topic: "বন্ধন শক্তি" },
};

function cleanMathAndHtml(str: string): string {
  if (!str) return "";
  let s = str
    .replace(/<sup[^>]*>\s*(.*?)\s*<\/sup>/gi, "^$1")
    .replace(/<sub[^>]*>\s*(.*?)\s*<\/sub>/gi, "_$1")
    .replace(/<\/?(?:u|b|i|span|p|div|br)[^>]*>/gi, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/[\u00A0\u200B\u200C\u200D]/g, " ");

  return s.trim();
}

console.log("Helper loaded.");
