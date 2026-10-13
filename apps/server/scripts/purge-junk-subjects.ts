import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { recalculateAllCounts } from '../src/modules/qb/qb-count.js';

const client = postgres('postgresql://paws:df8f13a4@127.0.0.1:5432/paws', { max: 20 });
const db = drizzle(client);

async function purgeJunkSubjects() {
  console.log('Starting precision purge of non-core stray subjects across admission units...');

  // 1. Engineering Target Strays
  const engStrays = await client`
    SELECT DISTINCT q.id as question_id, qs.source_id, s.name as source_name, sub.name as subject_name
    FROM qb_targets t
    JOIN qb_containers c ON c.target_id = t.id
    JOIN qb_container_items ci ON ci.container_id = c.id
    JOIN qb_sources s ON s.container_item_id = ci.id
    JOIN qb_question_sources qs ON qs.source_id = s.id
    JOIN qb_questions q ON q.id = qs.question_id
    JOIN qb_topics top ON top.id = q.topic_id
    JOIN qb_chapters chap ON chap.id = top.chapter_id
    JOIN qb_subjects sub ON sub.id = chap.subject_id
    WHERE t.slug = 'engineering-admission'
      AND sub.name IN ('বাংলা ব্যাকরন', 'সাধারণ গণিত', 'সাধারন জ্ঞান আন্তর্জাতিক');
  `;
  console.log(`Found ${engStrays.length} stray questions in Engineering Admission.`);

  // 2. Science Units with Stray Commerce / Humanities Subjects
  const scienceUnitStrays = await client`
    SELECT DISTINCT q.id as question_id, qs.source_id, s.name as source_name, sub.name as subject_name
    FROM qb_targets t
    JOIN qb_containers c ON c.target_id = t.id
    JOIN qb_container_items ci ON ci.container_id = c.id
    JOIN qb_sources s ON s.container_item_id = ci.id
    JOIN qb_question_sources qs ON qs.source_id = s.id
    JOIN qb_questions q ON q.id = qs.question_id
    JOIN qb_topics top ON top.id = q.topic_id
    JOIN qb_chapters chap ON chap.id = top.chapter_id
    JOIN qb_subjects sub ON sub.id = chap.subject_id
    WHERE ci.slug IN ('a-unit', 'unit-a', 'science-unit')
      AND c.slug IN ('du-question-bank', 'cu-question-bank', 'jnu-question-bank', 'sust-question-bank', 'ju-question-bank')
      AND sub.name IN (
        'হিসাববিজ্ঞান প্রথম পত্র', 'হিসাববিজ্ঞান দ্বিতীয় পত্র', 
        'ব্যবসায় সংগঠন ও ব্যবস্থাপনা প্রথম পত্র', 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা দ্বিতীয় পত্র', 
        'পৌরনীতি ও সুশাসন প্রথম পত্র', 'পৌরনীতি ও সুশাসন দ্বিতীয় পত্র', 
        'সমাজকর্ম প্রথম পত্র', 'ইসলামের ইতিহাস ও সংস্কৃতি প্রথম পত্র',
        'ফিন্যান্স, ব্যাংকিং ও বীমা প্রথম পত্র', 'ফিন্যান্স, ব্যাংকিং ও বীমা দ্বিতীয় পত্র',
        'উৎপাদন ব্যবস্থাপনা ও বিপণন প্রথম পত্র', 'উৎপাদন ব্যবস্থাপনা ও বিপণন দ্বিতীয় পত্র'
      );
  `;
  console.log(`Found ${scienceUnitStrays.length} stray questions in Science Units.`);

  // 3. Commerce / Business Units with Stray Science Subjects
  const commerceUnitStrays = await client`
    SELECT DISTINCT q.id as question_id, qs.source_id, s.name as source_name, sub.name as subject_name
    FROM qb_targets t
    JOIN qb_containers c ON c.target_id = t.id
    JOIN qb_container_items ci ON ci.container_id = c.id
    JOIN qb_sources s ON s.container_item_id = ci.id
    JOIN qb_question_sources qs ON qs.source_id = s.id
    JOIN qb_questions q ON q.id = qs.question_id
    JOIN qb_topics top ON top.id = q.topic_id
    JOIN qb_chapters chap ON chap.id = top.chapter_id
    JOIN qb_subjects sub ON sub.id = chap.subject_id
    WHERE ci.slug IN ('c-unit', 'unit-c', 'commerce-unit', 'e-unit', 'fbs')
      AND c.slug IN ('du-question-bank', 'cu-question-bank', 'jnu-question-bank', 'ju-question-bank', 'ku-question-bank')
      AND sub.name IN (
        'পদার্থবিজ্ঞান প্রথম পত্র', 'পদার্থবিজ্ঞান দ্বিতীয় পত্র', 
        'রসায়ন প্রথম পত্র', 'রসায়ন দ্বিতীয় পত্র', 
        'জীববিজ্ঞান প্রথম পত্র', 'জীববিজ্ঞান দ্বিতীয় পত্র', 
        'উচ্চতর গণিত প্রথম পত্র', 'উচ্চতর গণিত দ্বিতীয় পত্র'
      );
  `;
  console.log(`Found ${commerceUnitStrays.length} stray questions in Commerce / Business Units.`);

  // 4. IBA-JU and Law Unit Strays
  const specializedStrays = await client`
    SELECT DISTINCT q.id as question_id, qs.source_id, s.name as source_name, sub.name as subject_name
    FROM qb_targets t
    JOIN qb_containers c ON c.target_id = t.id
    JOIN qb_container_items ci ON ci.container_id = c.id
    JOIN qb_sources s ON s.container_item_id = ci.id
    JOIN qb_question_sources qs ON qs.source_id = s.id
    JOIN qb_questions q ON q.id = qs.question_id
    JOIN qb_topics top ON top.id = q.topic_id
    JOIN qb_chapters chap ON chap.id = top.chapter_id
    JOIN qb_subjects sub ON sub.id = chap.subject_id
    WHERE c.slug = 'ju-question-bank'
      AND (
        (ci.slug = 'iba-ju' AND sub.name IN (
          'রসায়ন প্রথম পত্র', 'রসায়ন দ্বিতীয় পত্র', 
          'জীববিজ্ঞান প্রথম পত্র', 'জীববিজ্ঞান দ্বিতীয় পত্র', 
          'পদার্থবিজ্ঞান প্রথম পত্র', 'পদার্থবিজ্ঞান দ্বিতীয় পত্র', 
          'পৌরনীতি ও সুশাসন প্রথম পত্র', 'পৌরনীতি ও সুশাসন দ্বিতীয় পত্র',
          'ব্যবসায় সংগঠন ও ব্যবস্থাপনা দ্বিতীয় পত্র',
          'উৎপাদন ব্যবস্থাপনা ও বিপণন দ্বিতীয় পত্র'
        ))
        OR (ci.slug = 'f-unit' AND sub.name IN (
          'পদার্থবিজ্ঞান প্রথম পত্র', 'রসায়ন প্রথম পত্র', 'জীববিজ্ঞান প্রথম পত্র'
        ))
      );
  `;
  console.log(`Found ${specializedStrays.length} stray questions in IBA-JU & Specialized Units.`);

  // Combine all junk links to remove
  const allJunk = [...engStrays, ...scienceUnitStrays, ...commerceUnitStrays, ...specializedStrays];
  console.log(`Total stray link associations to remove: ${allJunk.length}`);

  let removedSourcesCount = 0;
  for (const item of allJunk) {
    const res = await client`
      DELETE FROM qb_question_sources 
      WHERE question_id = ${item.question_id} 
        AND source_id = ${item.source_id}
    `;
    removedSourcesCount += res.count;
  }
  console.log(`Successfully removed ${removedSourcesCount} stray question-source links.`);

  // Remove orphan questions if they are no longer linked to any source
  const orphans = await client`
    SELECT q.id 
    FROM qb_questions q
    LEFT JOIN qb_question_sources qs ON qs.question_id = q.id
    WHERE qs.question_id IS NULL;
  `;

  if (orphans.length > 0) {
    const orphanIds = orphans.map((o: any) => o.id);
    console.log(`Cleaning up ${orphanIds.length} orphan questions with zero remaining sources...`);
    await client`DELETE FROM qb_question_options WHERE question_id = ANY(${orphanIds})`;
    await client`DELETE FROM qb_questions WHERE id = ANY(${orphanIds})`;
    console.log(`Purged orphan questions.`);
  }

  console.log('Recalculating all database question counts across full hierarchy...');
  await recalculateAllCounts(db);
  console.log('All hierarchy question counts synchronized and pristine!');

  await client.end();
}

purgeJunkSubjects().catch((err) => {
  console.error('Error purging junk subjects:', err);
  process.exit(1);
});
