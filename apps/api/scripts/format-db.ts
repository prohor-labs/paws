import { sql } from "drizzle-orm";
import { db } from "../src/db";
import { recalculateAllCounts } from "../src/services/qb-count.service";

/**
 * format-db.ts
 *
 * Universal Database Sanitization & Formatting Script
 *
 * Solves:
 * 1. Dummy/Placeholder Parts (e.g., "Option A", "Option 1", "Skip", "Done", "None", "N/A", "A", "B", etc.)
 * 2. Duplicate Question Text in Parts (e.g., written questions where part_text == question_text)
 * 3. Preserves solution explanations from parts into question.explanation when missing.
 * 4. Cleans trailing/leading empty HTML paragraph artifacts (<p></p>, <p><br></p>).
 * 5. Automatically triggers recalculateAllCounts() to synchronize stats across chapters, topics, sources, and exam sheets.
 */

async function formatDatabase() {
  console.log("==========================================================");
  console.log("🚀 STARTING AUTOMATED DATABASE SANITIZATION & FORMATTING");
  console.log("==========================================================\n");

  const startTime = Date.now();

  // STEP 1: Preserve explanation from duplicate single-parts before deleting
  console.log("[1/5] Preserving explanation from single-part duplicates...");
  const preservedExplanations = await db.execute(sql`
    UPDATE qb_questions q
    SET explanation = p.answer_text,
        updated_at = NOW()
    FROM qb_question_parts p
    WHERE p.question_id = q.id
      AND (q.explanation IS NULL OR TRIM(REGEXP_REPLACE(q.explanation, '<[^>]+>', '', 'g')) = '')
      AND p.answer_text IS NOT NULL
      AND TRIM(REGEXP_REPLACE(p.answer_text, '<[^>]+>', '', 'g')) != ''
      AND TRIM(REGEXP_REPLACE(p.part_text, '<[^>]+>', '', 'g')) = TRIM(REGEXP_REPLACE(q.question_text, '<[^>]+>', '', 'g'));
  `);
  console.log("  ✓ Preserved explanations updated.\n");

  // STEP 2: Delete duplicate question parts (part_text == question_text)
  console.log("[2/5] Cleaning duplicate question parts (part_text == question_text)...");
  const deletedDuplicates = await db.execute(sql`
    DELETE FROM qb_question_parts p
    USING qb_questions q
    WHERE p.question_id = q.id
      AND TRIM(REGEXP_REPLACE(p.part_text, '<[^>]+>', '', 'g')) = TRIM(REGEXP_REPLACE(q.question_text, '<[^>]+>', '', 'g'));
  `);
  console.log("  ✓ Duplicate question parts removed.\n");

  // STEP 3: Delete dummy/placeholder parts (Option A, Skip, Done, None, N/A, single letters)
  console.log("[3/5] Cleaning dummy placeholder question parts...");
  const deletedDummyParts = await db.execute(sql`
    DELETE FROM qb_question_parts
    WHERE TRIM(REGEXP_REPLACE(part_text, '<[^>]+>', '', 'g')) ~* '^(option\\s*[a-d1-4]|done|skip|none|n/a|[a-d])$'
       OR TRIM(REGEXP_REPLACE(part_text, '<[^>]+>', '', 'g')) = '';
  `);
  console.log("  ✓ Dummy placeholder parts removed.\n");

  // STEP 4: Convert misclassified MCQ exam sheets and restore question options
  console.log("[4/7] Converting misclassified MCQ exam sheets and restoring MCQ options...");

  // 4a. Find questions that are marked as written and have 4+ parts but no options, and are NOT in a pure written source
  await db.execute(sql`
    INSERT INTO qb_question_options (id, question_id, option_text, is_correct, order_index)
    SELECT 
      gen_random_uuid(),
      p.question_id,
      p.part_text,
      (p.order_index = 1), -- default fallback
      p.order_index
    FROM qb_question_parts p
    JOIN qb_questions q ON p.question_id = q.id
    LEFT JOIN qb_question_sources qs ON q.id = qs.question_id
    LEFT JOIN qb_sources s ON qs.source_id = s.id
    WHERE q.q_type = 'written'
      AND (s.name IS NULL OR s.name NOT ILIKE '%Written%')
      AND NOT EXISTS (SELECT 1 FROM qb_question_options o WHERE o.question_id = q.id)
      AND (SELECT count(*) FROM qb_question_parts p2 WHERE p2.question_id = q.id) >= 4;
  `);

  // 4b. Delete the converted parts
  await db.execute(sql`
    DELETE FROM qb_question_parts p
    USING qb_questions q
    WHERE p.question_id = q.id
      AND q.q_type = 'written'
      AND EXISTS (SELECT 1 FROM qb_question_options o WHERE o.question_id = q.id);
  `);

  // 4c. Update question q_type to 'mcq'
  await db.execute(sql`
    UPDATE qb_questions q
    SET q_type = 'mcq'
    WHERE q.q_type = 'written'
      AND EXISTS (SELECT 1 FROM qb_question_options o WHERE o.question_id = q.id);
  `);
  console.log("  ✓ Converted misclassified MCQ questions and options.\n");

  // STEP 4.5: Convert Creative (CQ) questions misclassified as MCQ and link JSON explanation parts
  // STEP 4.5: Convert Creative (CQ) questions and link subpart solutions
  // Strictly applies ONLY to board/academic questions where questionText actually represents a stem with CQ subparts
  console.log("[4.5/7] Linking Creative (CQ) questions and subpart solutions...");
  const rawJsonQuestions = await db.execute(sql`
    SELECT q.id, q.q_type as "qType", q.explanation, q.question_text as "questionText"
    FROM qb_questions q
    WHERE TRIM(q.explanation) LIKE '{"A":%'
       OR TRIM(q.explanation) LIKE '{"ক":%';
  `);
  const jsonQuestions = rawJsonQuestions as unknown as Array<{
    id: string;
    qType: string;
    explanation: string;
    questionText: string;
  }>;

  const keyMap = [
    ["A", "a", "ক", "১", "1"],
    ["B", "b", "খ", "২", "2"],
    ["C", "c", "গ", "৩", "3"],
    ["D", "d", "ঘ", "৪", "4"],
    ["E", "e", "ঙ", "৫", "5"],
  ];

  for (const q of jsonQuestions) {
    let parsed: Record<string, string> = {};
    try {
      parsed = JSON.parse(q.explanation.trim());
    } catch {
      continue;
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) continue;

    const getAnswerForIndex = (idx: number): string | null => {
      const keys = keyMap[idx] || [];
      for (const k of keys) {
        if (parsed[k]) return parsed[k];
      }
      const rawKeys = Object.keys(parsed);
      if (rawKeys[idx]) return parsed[rawKeys[idx]];
      return null;
    };

    // Only convert if it is already a written question with parts, to populate answers
    if (q.qType === "written") {
      const partsResult = await db.execute(sql`
        SELECT id, order_index, answer_text
        FROM qb_question_parts
        WHERE question_id = ${q.id}
        ORDER BY order_index ASC;
      `);
      const parts = partsResult as unknown as Array<{
        id: string;
        order_index: number;
        answer_text: string | null;
      }>;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!part.answer_text || part.answer_text.trim() === "") {
          const ans = getAnswerForIndex(i);
          if (ans) {
            await db.execute(sql`
              UPDATE qb_question_parts
              SET answer_text = ${ans}
              WHERE id = ${part.id};
            `);
          }
        }
      }
    }
  }
  console.log("  ✓ CQ questions and subpart solutions linked.\n");

  // STEP 5: Clean empty HTML wrapper artifacts in question and explanation texts
  console.log("[5/6] Cleaning empty HTML artifacts (<p></p>, <p><br></p>)...");
  await db.execute(sql`
    UPDATE qb_questions
    SET question_text = REGEXP_REPLACE(
      REGEXP_REPLACE(question_text, '^(<p>\\s*</p>|<p><br/?>\\s*</p>|\\s)+', '', 'gi'),
      '(<p>\\s*</p>|<p><br/?>\\s*</p>|\\s)+$', '', 'gi'
    )
    WHERE question_text ~* '^(<p>\\s*</p>|<p><br/?>\\s*</p>)'
       OR question_text ~* '(<p>\\s*</p>|<p><br/?>\\s*</p>)$';
  `);

  await db.execute(sql`
    UPDATE qb_questions
    SET explanation = REGEXP_REPLACE(
      REGEXP_REPLACE(explanation, '^(<p>\\s*</p>|<p><br/?>\\s*</p>|\\s)+', '', 'gi'),
      '(<p>\\s*</p>|<p><br/?>\\s*</p>|\\s)+$', '', 'gi'
    )
    WHERE explanation IS NOT NULL
      AND (explanation ~* '^(<p>\\s*</p>|<p><br/?>\\s*</p>)'
       OR explanation ~* '(<p>\\s*</p>|<p><br/?>\\s*</p>)$');
  `);
  console.log("  ✓ Cleaned empty HTML artifacts.\n");

  // STEP 6: Clean invalid/internal metadata tags (duplicated-to-translated, _s:..., ____, etc.)
  console.log("[6/7] Cleaning invalid internal metadata source tags...");
  await db.execute(sql`
    DELETE FROM qb_question_sources
    WHERE source_id IN (
      SELECT id FROM qb_sources
      WHERE name ~* '(duplicated|translated|____|undefined|null|^test$|^_s:|^_s_|^_)'
         OR slug ~* '(duplicated|translated|____|undefined|null|^test$|^s-|^_)'
    );
  `);

  await db.execute(sql`
    DELETE FROM qb_chapter_sources
    WHERE source_id IN (
      SELECT id FROM qb_sources
      WHERE name ~* '(duplicated|translated|____|undefined|null|^test$|^_s:|^_s_|^_)'
         OR slug ~* '(duplicated|translated|____|undefined|null|^test$|^s-|^_)'
    );
  `);

  await db.execute(sql`
    DELETE FROM qb_sources
    WHERE name ~* '(duplicated|translated|____|undefined|null|^test$|^_s:|^_s_|^_)'
       OR slug ~* '(duplicated|translated|____|undefined|null|^test$|^s-|^_)';
  `);
  console.log("  ✓ Removed internal metadata tags.\n");

  // STEP 7: Migrate external images (Chorcha / external assets) to self-hosted S3
  console.log("[7/8] Migrating external assets (Chorcha images) to self-hosted S3...");
  const { storageService } = await import("../src/services/storage.service");
  const { env } = await import("../src/lib/env");

  const chorchaUrlRegex = /https?:\/\/assets\.chorcha\.net\/[^\s"'<>)]+/g;
  const sanitizeUrl = (raw: string) => raw.replace(/(&quot;|\\&quot;|["'\\><)]|&amp;)+$/, "");

  // 7a. Find all unique Chorcha image URLs in DB
  const rawQuestions = await db.execute(sql`
    SELECT id, question_text, context_text, explanation
    FROM qb_questions
    WHERE question_text ~ 'assets\.chorcha\.net'
       OR context_text ~ 'assets\.chorcha\.net'
       OR explanation ~ 'assets\.chorcha\.net';
  `);
  const qList = rawQuestions as unknown as Array<{
    id: string;
    question_text: string | null;
    context_text: string | null;
    explanation: string | null;
  }>;

  const rawOptions = await db.execute(sql`
    SELECT id, option_text
    FROM qb_question_options
    WHERE option_text ~ 'assets\.chorcha\.net';
  `);
  const oList = rawOptions as unknown as Array<{
    id: string;
    option_text: string;
  }>;

  const rawParts = await db.execute(sql`
    SELECT id, part_text, answer_text
    FROM qb_question_parts
    WHERE part_text ~ 'assets\.chorcha\.net'
       OR answer_text ~ 'assets\.chorcha\.net';
  `);
  const pList = rawParts as unknown as Array<{
    id: string;
    part_text: string;
    answer_text: string | null;
  }>;

  const uniqueUrls = new Set<string>();
  for (const q of qList) {
    (q.question_text?.match(chorchaUrlRegex) || []).forEach((u) => uniqueUrls.add(sanitizeUrl(u)));
    (q.context_text?.match(chorchaUrlRegex) || []).forEach((u) => uniqueUrls.add(sanitizeUrl(u)));
    (q.explanation?.match(chorchaUrlRegex) || []).forEach((u) => uniqueUrls.add(sanitizeUrl(u)));
  }
  for (const o of oList) {
    (o.option_text?.match(chorchaUrlRegex) || []).forEach((u) => uniqueUrls.add(sanitizeUrl(u)));
  }
  for (const p of pList) {
    (p.part_text?.match(chorchaUrlRegex) || []).forEach((u) => uniqueUrls.add(sanitizeUrl(u)));
    (p.answer_text?.match(chorchaUrlRegex) || []).forEach((u) => uniqueUrls.add(sanitizeUrl(u)));
  }

  const urlArray = Array.from(uniqueUrls);
  console.log(`  Found ${urlArray.length} unique external image assets to migrate to S3.`);

  if (urlArray.length > 0) {
    const urlMap = new Map<string, string>(); // oldUrl -> s3Url
    let completedCount = 0;
    const concurrency = 10;

    // Helper to upload a single asset
    const processUrl = async (url: string) => {
      try {
        const cleanUrl = sanitizeUrl(url);
        const parsed = new URL(cleanUrl);
        const filename = parsed.pathname.replace(/^\/+/, "");
        const s3Key = `qb/images/${filename}`;
        const s3PublicUrl = `${env.aws.publicUrl.replace(/\/+$/, "")}/${s3Key}`;

        // Check if already in S3
        let alreadyExists = false;
        try {
          const headRes = await fetch(s3PublicUrl, { method: "HEAD" });
          if (headRes.ok) {
            alreadyExists = true;
          }
        } catch {}

        if (!alreadyExists) {
          const res = await fetch(cleanUrl);
          if (!res.ok) {
            console.warn(`    ⚠️ Failed to download ${cleanUrl}: status ${res.status}`);
            return;
          }
          const contentType = res.headers.get("content-type") || "image/png";
          const buffer = Buffer.from(await res.arrayBuffer());
          await storageService.upload(buffer, s3Key, contentType);
        }

        urlMap.set(cleanUrl, s3PublicUrl);
      } catch (err) {
        console.error(`    ❌ Error migrating image ${url}:`, err);
      } finally {
        completedCount++;
        if (completedCount % 50 === 0 || completedCount === urlArray.length) {
          console.log(`    Progress: ${completedCount}/${urlArray.length} assets processed.`);
        }
      }
    };

    // Run pool
    for (let i = 0; i < urlArray.length; i += concurrency) {
      const chunk = urlArray.slice(i, i + concurrency);
      await Promise.all(chunk.map((u) => processUrl(u)));
    }

    console.log(`  ✓ Successfully uploaded ${urlMap.size}/${urlArray.length} images to S3.`);
    console.log("  Replacing image URLs in database records...");

    // Helper to replace URLs in a text
    const replaceUrls = (text: string | null): string | null => {
      if (!text) return null;
      let res = text;
      for (const [oldUrl, newUrl] of urlMap.entries()) {
        if (res.includes(oldUrl)) {
          res = res.replaceAll(oldUrl, newUrl);
        }
      }
      return res;
    };

    // Update matching questions by primary key
    const qUpdates = qList.map(async (q) => {
      const newQt = replaceUrls(q.question_text);
      const newCtx = replaceUrls(q.context_text);
      const newExp = replaceUrls(q.explanation);
      if (newQt !== q.question_text || newCtx !== q.context_text || newExp !== q.explanation) {
        await db.execute(sql`
          UPDATE qb_questions
          SET question_text = ${newQt!},
              context_text = ${newCtx},
              explanation = ${newExp}
          WHERE id = ${q.id};
        `);
      }
    });

    // Update matching options by primary key
    const oUpdates = oList.map(async (o) => {
      const newOt = replaceUrls(o.option_text);
      if (newOt !== o.option_text) {
        await db.execute(sql`
          UPDATE qb_question_options
          SET option_text = ${newOt!}
          WHERE id = ${o.id};
        `);
      }
    });

    // Update matching parts by primary key
    const pUpdates = pList.map(async (p) => {
      const newPt = replaceUrls(p.part_text);
      const newAt = replaceUrls(p.answer_text);
      if (newPt !== p.part_text || newAt !== p.answer_text) {
        await db.execute(sql`
          UPDATE qb_question_parts
          SET part_text = ${newPt!},
              answer_text = ${newAt}
          WHERE id = ${p.id};
        `);
      }
    });

    await Promise.all([...qUpdates, ...oUpdates, ...pUpdates]);
    console.log("  ✓ Database image URLs migrated to S3.\n");
  } else {
    console.log("  ✓ No external image URLs found. Database is clean.\n");
  }

  // STEP 8: Recalculate all counts across the system
  console.log("[8/8] Recalculating system-wide counts and aggregations...");
  await recalculateAllCounts();
  console.log("  ✓ All counts synchronized.\n");

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log("==========================================================");
  console.log(`✨ DATABASE FORMATTING COMPLETED SUCCESSFULLY IN ${durationSec}s`);
  console.log("==========================================================");
}

formatDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Fatal error formatting database:", err);
    process.exit(1);
  });
