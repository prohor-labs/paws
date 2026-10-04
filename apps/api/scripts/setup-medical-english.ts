import { db } from "../src/db";
import {
  qbSubjects,
  qbChapters,
  qbTopics,
  qbQuestionChapters,
  qbContainerItems,
  qbQuestions,
} from "../src/db/schema";
import { v7 as uuidv7 } from "uuid";
import { eq, sql } from "drizzle-orm";
import { recalculateAllCounts } from "../src/services/qb-count.service";

const CHAPTERS_CONFIG = [
  {
    name: "Parts of Speech & Identification",
    slug: "parts-of-speech",
    orderIndex: 1,
    matcher: (text: string) =>
      /noun|pronoun|adjective|adverb|conjunction|interjection|determiner|part of speech|abstract noun|collective noun/i.test(text),
  },
  {
    name: "Preposition & Appropriate Preposition",
    slug: "prepositions",
    orderIndex: 2,
    matcher: (text: string) =>
      /preposition|appropriate preposition|accustomed to|abide by|absorb in|adhere to|agree with|afraid of/i.test(text),
  },
  {
    name: "Synonyms & Antonyms",
    slug: "synonyms-antonyms",
    orderIndex: 3,
    matcher: (text: string) =>
      /synonym|antonym|same meaning|opposite meaning/i.test(text),
  },
  {
    name: "Right Form of Verbs, Tenses & Conditionals",
    slug: "verbs-tenses-conditionals",
    orderIndex: 4,
    matcher: (text: string) =>
      /right form of verb|subject-verb agreement|tenses|conditional|subjunctive|gerund|participle|infinitive/i.test(text),
  },
  {
    name: "Voice Change & Narration",
    slug: "voice-narration",
    orderIndex: 5,
    matcher: (text: string) =>
      /passive voice|active voice|voice change|direct speech|indirect speech|narration/i.test(text),
  },
  {
    name: "Idioms, Phrases & Clauses",
    slug: "idioms-phrases-clauses",
    orderIndex: 6,
    matcher: (text: string) =>
      /idiom|phrase|clause|subordinate clause|principal clause|call it a day|apple of eye|at a loss/i.test(text),
  },
  {
    name: "Sentence Correction & Transformation",
    slug: "sentence-correction",
    orderIndex: 7,
    matcher: (text: string) =>
      /correct sentence|incorrect sentence|grammatically correct|transformation|affirmative|negative|interrogative|complex|compound|simple sentence/i.test(text),
  },
  {
    name: "Spelling & Vocabulary Usage",
    slug: "spelling-vocabulary",
    orderIndex: 8,
    matcher: (text: string) =>
      /spelling|correctly spelt|misspelt|mis-spelt|correct spelling/i.test(text),
  },
  {
    name: "Translation & Proverbs",
    slug: "translation-proverbs",
    orderIndex: 9,
    matcher: (text: string) =>
      /translation|proverb|translate into english|translate into bangla|bengali phrase/i.test(text),
  },
];

function isEnglishQuestion(text: string): boolean {
  const clean = text.replace(/<[^>]+>/g, " ").trim();
  const bengaliChars = (clean.match(/[\u0980-\u09FF]/g) || []).length;
  const englishWords = (clean.match(/[a-zA-Z]{2,}/g) || []).length;

  if (
    clean.toLowerCase().includes("antonym") ||
    clean.toLowerCase().includes("synonym") ||
    clean.toLowerCase().includes("preposition") ||
    clean.toLowerCase().includes("translation") ||
    clean.toLowerCase().includes("idiom") ||
    clean.toLowerCase().includes("correct sentence") ||
    clean.toLowerCase().includes("passive voice") ||
    clean.toLowerCase().includes("active voice") ||
    clean.toLowerCase().includes("correct spelling") ||
    clean.toLowerCase().includes("noun") ||
    clean.toLowerCase().includes("adjective") ||
    clean.toLowerCase().includes("adverb") ||
    clean.toLowerCase().includes("verb")
  ) {
    return true;
  }

  return englishWords >= 3 && bengaliChars < 10;
}

async function setupMedicalEnglish() {
  console.log("=== Setting up Medical English Subject & Topic Hierarchy ===");

  // 1. Create or Find "Medical English" Subject
  let [subject] = await db
    .select()
    .from(qbSubjects)
    .where(eq(qbSubjects.slug, "med-english-subject"));

  if (!subject) {
    const newSubId = uuidv7();
    [subject] = await db
      .insert(qbSubjects)
      .values({
        id: newSubId,
        name: "মেডিকেল ইংরেজি (Medical English)",
        slug: "med-english-subject",
        description: "মেডিকেল ও ডেন্টাল ভর্তি পরীক্ষার গ্রামার ও ভোকাবুলারিভিত্তিক অধ্যায়সমূহ",
        orderIndex: 7,
      })
      .returning();
    console.log(`Created Subject: "${subject.name}" (${subject.id})`);
  }

  // 2. Link "med-english" Container Item to this Subject
  await db
    .update(qbContainerItems)
    .set({ subjectId: subject.id, name: "মেডিকেল ইংরেজি (Medical English)" })
    .where(eq(qbContainerItems.slug, "med-english"));
  console.log(`Linked med-english container item to subject ${subject.id}`);

  // 3. Create Chapters
  const chapterMap = new Map<string, any>();
  for (const chConfig of CHAPTERS_CONFIG) {
    let [chapter] = await db
      .select()
      .from(qbChapters)
      .where(sql`${qbChapters.subjectId} = ${subject.id} AND ${qbChapters.slug} = ${chConfig.slug}`);

    if (!chapter) {
      const newChId = uuidv7();
      [chapter] = await db
        .insert(qbChapters)
        .values({
          id: newChId,
          subjectId: subject.id,
          name: chConfig.name,
          slug: chConfig.slug,
          orderIndex: chConfig.orderIndex,
        })
        .returning();
      console.log(`Created Chapter: "${chapter.name}" (${chapter.id})`);
    }

    chapterMap.set(chConfig.slug, chapter);
  }

  const fallbackChapter = chapterMap.get("parts-of-speech") || Array.from(chapterMap.values())[0];

  // 4. Fetch all Medical Questions from past papers
  const allMedicalQuestions = await db.execute(sql`
    SELECT DISTINCT q.id, q.question_text, q.explanation
    FROM qb_questions q
    JOIN qb_exam_sheet_questions esq ON esq.question_id = q.id
    JOIN qb_exam_sheets es ON es.id = esq.exam_sheet_id
    JOIN qb_container_items ci ON ci.id = es.container_item_id
    WHERE ci.slug IN ('mbbs-past-questions', 'bds-past-questions', 'afmc-past-questions')
  `);

  console.log(`Total Past Paper Questions evaluated: ${allMedicalQuestions.length}`);

  let linkedCount = 0;
  for (const row of allMedicalQuestions) {
    const qId = row.id as string;
    const qText = (row.question_text as string) || "";
    const qExp = (row.explanation as string) || "";
    const combined = `${qText} ${qExp}`;

    if (!isEnglishQuestion(qText)) {
      continue;
    }

    // Match appropriate chapter
    let matchedChapter = null;
    for (const chConfig of CHAPTERS_CONFIG) {
      if (chConfig.matcher(combined)) {
        matchedChapter = chapterMap.get(chConfig.slug);
        break;
      }
    }

    if (!matchedChapter) {
      matchedChapter = fallbackChapter;
    }

    // Link question to chapter
    await db
      .insert(qbQuestionChapters)
      .values({
        questionId: qId,
        chapterId: matchedChapter.id,
      })
      .onConflictDoNothing();

    linkedCount++;
  }

  console.log(`Successfully mapped and linked ${linkedCount} English questions to Medical English chapters!`);

  console.log("\nRecalculating all question & exam counts across database...");
  await recalculateAllCounts();
  console.log("All counts recalculated! Medical English is now populated and live.");
}

setupMedicalEnglish()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
