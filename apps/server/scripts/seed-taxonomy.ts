import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { qbSubjects, qbChapters, qbTopics } from "../src/common/database/schema/qb.js";
import { sql } from "drizzle-orm";
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0980-\u09FF-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim() || `item-${Math.random().toString(36).substring(2, 9)}`;
}

async function main() {
  const dbUrl = process.env.DATABASE_URL || "postgresql://paws:df8f13a4@127.0.0.1:5432/paws";
  console.log("Connecting to Database:", dbUrl);
  const client = postgres(dbUrl, { max: 10 });
  const db = drizzle(client);

  const rawJson = await Bun.file("/root/Hulk/data/studyclub/cleaned_master_taxonomy.json").json();
  console.log(`Loaded ${rawJson.length} subjects from cleaned master taxonomy.`);

  let insertedSubjects = 0;
  let insertedChapters = 0;
  let insertedTopics = 0;

  for (let sIdx = 0; sIdx < rawJson.length; sIdx++) {
    const s = rawJson[sIdx];
    
    // Determine level
    let level: "jsc" | "ssc" | "hsc" | "admission" | "job" | "other" = "other";
    if (s.name.includes("প্রথম পত্র") || s.name.includes("দ্বিতীয় পত্র") || s.name.includes("১ম পত্র") || s.name.includes("২য় পত্র")) {
      level = "hsc";
    } else if (["বাংলা ব্যাকরন", "বাংলা সাহিত্য", "সাধারন জ্ঞান", "মানসিক দক্ষতা", "ইংরেজি"].some((kw: string) => s.name.includes(kw))) {
      level = "job";
    } else if (s.totalTopics === 0 && s.totalChapters > 1) {
      level = "ssc";
    } else {
      level = "admission";
    }

    const sSlugBase = toSlug(s.name) || `subj-${sIdx}`;
    const sSlug = `${sSlugBase}-${s.id.toLowerCase()}`;

    // Upsert Subject
    const [subjRow] = await db.insert(qbSubjects).values({
      name: s.name,
      slug: sSlug,
      code: s.id,
      level: level,
      orderIndex: sIdx,
      chapterCount: s.totalChapters,
      questionCount: 0
    }).onConflictDoUpdate({
      target: qbSubjects.slug,
      set: {
        name: s.name,
        code: s.id,
        level: level,
        orderIndex: sIdx,
        chapterCount: s.totalChapters
      }
    }).returning({ id: qbSubjects.id });

    insertedSubjects++;

    // Insert Chapters for this Subject
    for (let cIdx = 0; cIdx < s.chapters.length; cIdx++) {
      const c = s.chapters[cIdx];
      const cSlugBase = toSlug(c.name) || `chap-${cIdx}`;
      const cSlug = `${cSlugBase}-${c.id.toLowerCase()}`;

      const [chapRow] = await db.insert(qbChapters).values({
        subjectId: subjRow.id,
        name: c.name,
        slug: cSlug,
        orderIndex: cIdx,
        topicCount: c.totalTopics,
        questionCount: 0
      }).onConflictDoUpdate({
        target: [qbChapters.subjectId, qbChapters.slug],
        set: {
          name: c.name,
          orderIndex: cIdx,
          topicCount: c.totalTopics
        }
      }).returning({ id: qbChapters.id });

      insertedChapters++;

      // Insert Topics for this Chapter
      for (let tIdx = 0; tIdx < c.topics.length; tIdx++) {
        const t = c.topics[tIdx];
        const tSlugBase = toSlug(t.name) || `top-${tIdx}`;
        const tSlug = `${tSlugBase}-${t.id.toLowerCase()}`;

        await db.insert(qbTopics).values({
          chapterId: chapRow.id,
          name: t.name,
          slug: tSlug,
          orderIndex: tIdx,
          questionCount: 0
        }).onConflictDoUpdate({
          target: [qbTopics.chapterId, qbTopics.slug],
          set: {
            name: t.name,
            orderIndex: tIdx
          }
        });

        insertedTopics++;
      }
    }

    if ((sIdx + 1) % 10 === 0 || sIdx === rawJson.length - 1) {
      console.log(`[Progress] Pushed ${sIdx + 1}/${rawJson.length} Subjects | ${insertedChapters} Chapters | ${insertedTopics} Topics`);
    }
  }

  console.log("\n=======================================================");
  console.log("🎉 Subjects, Chapters, and Topics successfully pushed to PostgreSQL!");
  console.log(`✅ Total Subjects pushed: ${insertedSubjects}`);
  console.log(`✅ Total Chapters pushed: ${insertedChapters}`);
  console.log(`✅ Total Topics pushed:   ${insertedTopics}`);
  console.log("=======================================================\n");

  await client.end();
}

main().catch(console.error);
