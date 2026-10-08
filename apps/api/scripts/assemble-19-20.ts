import { readFileSync, writeFileSync } from "fs";
import { b1 } from "./bup-19-20-b1";
import { b2 } from "./bup-19-20-b2";
import { b3 } from "./bup-19-20-b3";
import { b4 } from "./bup-19-20-b4";
import { b5 } from "./bup-19-20-b5";

const raw = JSON.parse(readFileSync("/tmp/raw_19_20.json", "utf-8"));
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

const customMap19_20: Record<number, { chapter: string; topic: string }> = {
  1: { chapter: "Sentence Correction & Transformation", topic: "Sentence Structure" },
  2: { chapter: "GK English version", topic: "International Awards & Honors" },
  3: { chapter: "Right Form of Verbs, Tenses & Conditionals", topic: "Tag Questions" },
  4: { chapter: "Parts of Speech & Identification", topic: "Gender" },
  5: { chapter: "Parts of Speech & Identification", topic: "Parts of Speech Identification" },
  6: { chapter: "Sentence Correction & Transformation", topic: "Simple, Complex & Compound" },
  7: { chapter: "Spelling & Vocabulary Usage", topic: "Idioms & Phrases" },
  8: { chapter: "GK English version", topic: "World History" },
  10: { chapter: "Right Form of Verbs, Tenses & Conditionals", topic: "Subject-Verb Agreement" },
  11: { chapter: "GK English version", topic: "World Geography" },
  12: { chapter: "Sentence Correction & Transformation", topic: "Transformation of Sentences" },
  13: { chapter: "Spelling & Vocabulary Usage", topic: "Synonyms & Antonyms" },
  15: { chapter: "Preposition & Appropriate Preposition", topic: "Appropriate Preposition" },
  16: { chapter: "Parts of Speech & Identification", topic: "Group Verbs / Phrasal Verbs" },
  17: { chapter: "Parts of Speech & Identification", topic: "Determiners" },
  18: { chapter: "Spelling & Vocabulary Usage", topic: "Synonyms & Antonyms" },
  19: { chapter: "Right Form of Verbs, Tenses & Conditionals", topic: "Tenses" },
  21: { chapter: "GK English version", topic: "Liberation War of Bangladesh" },
  22: { chapter: "Parts of Speech & Identification", topic: "Participle & Gerund" },
  23: { chapter: "GK English version", topic: "World History & Geography" },
  24: { chapter: "GK English version", topic: "International Awards & Honors" },
  26: { chapter: "Right Form of Verbs, Tenses & Conditionals", topic: "Conditionals" },
  28: { chapter: "Preposition & Appropriate Preposition", topic: "Appropriate Preposition" },
  29: { chapter: "Preposition & Appropriate Preposition", topic: "Appropriate Preposition" },
  30: { chapter: "Spelling & Vocabulary Usage", topic: "Synonyms & Antonyms" },
  31: { chapter: "Spelling & Vocabulary Usage", topic: "Synonyms & Antonyms" },
  32: { chapter: "Right Form of Verbs, Tenses & Conditionals", topic: "Causative Verbs" },
  33: { chapter: "GK English version", topic: "World History" },
  34: { chapter: "GK English version", topic: "World History" },
  35: { chapter: "GK English version", topic: "International Recognition & Language" },
  36: { chapter: "GK English version", topic: "International Politics & Governance" },
  37: { chapter: "Parts of Speech & Identification", topic: "Noun" },
  38: { chapter: "Voice Change & Narration", topic: "Voice Change" },
  39: { chapter: "GK English version", topic: "Liberation War of Bangladesh" },
  40: { chapter: "GK English version", topic: "Geography of Bangladesh" },
  41: { chapter: "Parts of Speech & Identification", topic: "Analogy" },
  42: { chapter: "GK English version", topic: "Famous Personalities" },
  43: { chapter: "ব্যকরণ অংশ ( এডমিশন ) ", topic: "বাংলা সাহিত্যের ইতিহাস" },
  44: { chapter: "Right Form of Verbs, Tenses & Conditionals", topic: "Tenses" },
  45: { chapter: "Preposition & Appropriate Preposition", topic: "Appropriate Preposition" },
  46: { chapter: "Sentence Correction & Transformation", topic: "Conjunctions & Connectors" },
  47: { chapter: "Spelling & Vocabulary Usage", topic: "Spelling" },
  49: { chapter: "GK English version", topic: "International Days" },
  50: { chapter: "GK English version", topic: "International Organizations" },
  51: { chapter: "Spelling & Vocabulary Usage", topic: "Spelling" },
  52: { chapter: "GK English version", topic: "World Geography & Politics" },
  53: { chapter: "Parts of Speech & Identification", topic: "Noun" },
  54: { chapter: "Parts of Speech & Identification", topic: "Analogy" },
  55: { chapter: "GK English version", topic: "Mass Media & Technology" },
  56: { chapter: "Voice Change & Narration", topic: "Voice Change" },
  57: { chapter: "GK English version", topic: "World Geography" },
  58: { chapter: "Parts of Speech & Identification", topic: "Prefix & Suffix" },
  59: { chapter: "Voice Change & Narration", topic: "Voice Change" },
  60: { chapter: "Spelling & Vocabulary Usage", topic: "Idioms & Phrases" },
  61: { chapter: "ব্যকরণ অংশ ( এডমিশন ) ", topic: "এক কথায় প্রকাশ" },
  63: { chapter: "Preposition & Appropriate Preposition", topic: "Appropriate Preposition" },
  64: { chapter: "Parts of Speech & Identification", topic: "Parts of Speech Conversion" },
  65: { chapter: "Spelling & Vocabulary Usage", topic: "Idioms & Phrases" },
  66: { chapter: "ব্যকরণ অংশ ( এডমিশন ) ", topic: "পদ প্রকরণ " },
  67: { chapter: "GK English version", topic: "International Organizations" },
  68: { chapter: "Parts of Speech & Identification", topic: "Degree of Comparison" },
  70: { chapter: "Parts of Speech & Identification", topic: "Number" },
  74: { chapter: "GK English version", topic: "Historical Places of Bangladesh" },
  75: { chapter: "Parts of Speech & Identification", topic: "Pronoun" },
  76: { chapter: "Sentence Correction & Transformation", topic: "Sentence Correction" },
  77: { chapter: "English ", topic: "English Literature" },
  79: { chapter: "Spelling & Vocabulary Usage", topic: "Vocabulary" },
  81: { chapter: "GK English version", topic: "International Awards & Honors" },
  82: { chapter: "GK English version", topic: "Liberation War of Bangladesh" },
  83: { chapter: "Right Form of Verbs, Tenses & Conditionals", topic: "Prepositional Tenses" },
  84: { chapter: "ব্যকরণ অংশ ( এডমিশন ) ", topic: "বাংলা সাহিত্যের ইতিহাস" },
  85: { chapter: "Spelling & Vocabulary Usage", topic: "Spelling" },
  86: { chapter: "ব্যকরণ অংশ ( এডমিশন ) ", topic: "বাংলা সাহিত্যের ইতিহাস" },
  87: { chapter: "Spelling & Vocabulary Usage", topic: "Synonyms & Antonyms" },
  88: { chapter: "GK English version", topic: "Sports" },
  90: { chapter: "ব্যকরণ অংশ ( এডমিশন ) ", topic: "বাংলা সাহিত্যের ইতিহাস" },
  92: { chapter: "GK English version", topic: "Famous Personalities" },
  93: { chapter: "GK English version", topic: "History of Bengal" },
  94: { chapter: "GK English version", topic: "Famous Personalities" },
  95: { chapter: "Right Form of Verbs, Tenses & Conditionals", topic: "Irregular Verbs" },
  97: { chapter: "GK English version", topic: "International Conflicts & Organizations" },
  98: { chapter: "Preposition & Appropriate Preposition", topic: "Appropriate Preposition" },
  99: { chapter: "Spelling & Vocabulary Usage", topic: "Synonyms & Antonyms" },
  100: { chapter: "GK English version", topic: "Geography of Bangladesh" },
};

const allExps = {
  ...b1,
  ...b2,
  ...b3,
  ...b4,
  ...b5,
};

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
    .trim();
}

const processed = raw.map((q: any) => {
  const m = customMap19_20[q.index] || resolve(q.topicHint);
  if (!m || !m.chapter || !m.topic) {
    throw new Error(`Missing taxonomy for Q${q.index}`);
  }

  const exp = allExps[q.index as keyof typeof allExps];
  if (!exp) {
    throw new Error(`Missing explanation for Q${q.index}`);
  }

  const ans = q.options.find((o: any) => o.isCorrect)?.key;
  if (!ans) {
    throw new Error(`Missing correct answer for Q${q.index}`);
  }

  return {
    index: q.index,
    questionText: cleanHtml(q.questionText),
    options: q.options.map((o: any) => ({
      key: o.key,
      text: cleanHtml(o.text),
    })),
    answer: ans,
    explanation: exp,
    chapter: m.chapter,
    topic: m.topic,
    sources: q.sources ?? [],
  };
});

writeFileSync("/tmp/processed_19_20.json", JSON.stringify(processed, null, 2), "utf-8");
console.log(`Assembled ${processed.length} questions into /tmp/processed_19_20.json`);
