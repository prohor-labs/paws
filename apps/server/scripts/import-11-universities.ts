import * as cheerio from 'cheerio';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, sql } from 'drizzle-orm';
import {
  qbTargets,
  qbContainers,
  qbContainerItems,
  qbSubjects,
  qbChapters,
  qbTopics,
  qbQuestions,
  qbQuestionOptions,
  qbSources,
  qbQuestionSources
} from '../src/common/database/schema/qb.js';
import { recalculateAllCounts } from '../src/modules/qb/qb-count.js';

const client = postgres('postgresql://paws:df8f13a4@127.0.0.1:5432/paws', { max: 20 });
const db = drizzle(client);

const AJAX_URL = 'https://studyclubd.com/qb-archive/includes/ajax.php';
const VIEW_URL = 'https://studyclubd.com/view-question1/';

interface UniversityDef {
  name: string;
  code: string;
  slug: string;
  tag: string;
  units: {
    name: string;
    slug: string;
    unitCodes: string[];
    unitTag: string;
    orderIndex: number;
  }[];
}

const UNIVERSITIES: UniversityDef[] = [
  {
    name: 'Comilla University (CoU — কুবি)',
    code: 'UNI_9A2LDB',
    slug: 'cou-question-bank',
    tag: 'CoU',
    units: [
      { name: 'Unit A (বিজ্ঞান অনুষদ)', slug: 'unit-a', unitCodes: ['UNI_6321c505'], unitTag: 'Unit-A', orderIndex: 1 },
      { name: 'Unit B (কলা ও সামাজিক বিজ্ঞান অনুষদ)', slug: 'unit-b', unitCodes: ['UNI_f20da169'], unitTag: 'Unit-B', orderIndex: 2 },
      { name: 'Unit C (ব্যবসায় শিক্ষা অনুষদ)', slug: 'unit-c', unitCodes: ['UNI_d8e1d188'], unitTag: 'Unit-C', orderIndex: 3 },
    ]
  },
  {
    name: 'Bangabandhu Sheikh Mujibur Rahman Science & Tech University (BSMRSTU — বশেমুরবিপ্রবি)',
    code: 'UNI_M1NACF',
    slug: 'bsmrstu-question-bank',
    tag: 'BSMRSTU',
    units: [
      { name: 'Unit A (বিজ্ঞান ও প্রকৌশল)', slug: 'unit-a', unitCodes: ['UNI_6321c505'], unitTag: 'Unit-A', orderIndex: 1 },
      { name: 'Unit B (বিজ্ঞান)', slug: 'unit-b', unitCodes: ['UNI_f20da169'], unitTag: 'Unit-B', orderIndex: 2 },
      { name: 'Unit C (বিজ্ঞান/কৃষি)', slug: 'unit-c', unitCodes: ['UNI_d8e1d188'], unitTag: 'Unit-C', orderIndex: 3 },
      { name: 'Unit D (মানবিক)', slug: 'unit-d', unitCodes: ['UNI_79515993'], unitTag: 'Unit-D', orderIndex: 4 },
      { name: 'Unit E (ব্যবসায় শিক্ষা)', slug: 'unit-e', unitCodes: ['UNI_7a52cb22'], unitTag: 'Unit-E', orderIndex: 5 },
      { name: 'Unit G', slug: 'unit-g', unitCodes: ['UNI_89ea3a4d'], unitTag: 'Unit-G', orderIndex: 6 },
      { name: 'Unit H', slug: 'unit-h', unitCodes: ['UNI_23147d4a'], unitTag: 'Unit-H', orderIndex: 7 },
      { name: 'Unit I', slug: 'unit-i', unitCodes: ['UNI_d7add5b5'], unitTag: 'Unit-I', orderIndex: 8 },
    ]
  },
  {
    name: 'BSMR Maritime University (BSMRMU — মেরিটাইম বিশ্ববিদ্যালয়)',
    code: 'UNI_8242a0ea',
    slug: 'bsmrmu-question-bank',
    tag: 'BSMRMU',
    units: [
      { name: 'Faculty of Earth & Ocean Science (FEOS)', slug: 'feos', unitCodes: ['UNI_db55334d', 'UNI_7eb168cb'], unitTag: 'FEOS', orderIndex: 1 },
      { name: 'Faculty of Engineering & Technology (FET)', slug: 'fet', unitCodes: ['UNI_bf1e2d28'], unitTag: 'FET', orderIndex: 2 },
      { name: 'Faculty of Maritime Governance & Policy (FMGP)', slug: 'fmgp', unitCodes: ['UNI_eb4d914e'], unitTag: 'FMGP', orderIndex: 3 },
      { name: 'Faculty of Shipping Administration (FSA)', slug: 'fsa', unitCodes: ['UNI_39bc1c02'], unitTag: 'FSA', orderIndex: 4 },
    ]
  },
  {
    name: 'Noakhali Science & Technology University (NSTU — নোবিপ্রবি)',
    code: 'UNI_60F8YB',
    slug: 'nstu-question-bank',
    tag: 'NSTU',
    units: [
      { name: 'Unit A (বিজ্ঞান অনুষদ)', slug: 'unit-a', unitCodes: ['UNI_257efe06', 'UNI_6321c505'], unitTag: 'Unit-A', orderIndex: 1 },
      { name: 'Unit B (বিজ্ঞান অনুষদ)', slug: 'unit-b', unitCodes: ['UNI_f20da169'], unitTag: 'Unit-B', orderIndex: 2 },
      { name: 'Unit C (ব্যবসায় প্রশাসন)', slug: 'unit-c', unitCodes: ['UNI_d8e1d188'], unitTag: 'Unit-C', orderIndex: 3 },
      { name: 'Unit D (সামাজিক বিজ্ঞান ও মানবিক)', slug: 'unit-d', unitCodes: ['UNI_79515993'], unitTag: 'Unit-D', orderIndex: 4 },
      { name: 'Unit E (আইন অনুষদ)', slug: 'unit-e', unitCodes: ['UNI_7a52cb22'], unitTag: 'Unit-E', orderIndex: 5 },
    ]
  },
  {
    name: 'Islamic University Kushtia (IU — ইসলামী বিশ্ববিদ্যালয়)',
    code: 'UNI_PCY8BH',
    slug: 'iu-question-bank',
    tag: 'IU',
    units: [
      { name: 'Unit A (ধর্মতত্ত্ব ও ইসলামিক স্টাডিজ)', slug: 'unit-a', unitCodes: ['UNI_6321c505'], unitTag: 'Unit-A', orderIndex: 1 },
      { name: 'Unit B (কলা ও সমাজবিজ্ঞান)', slug: 'unit-b', unitCodes: ['UNI_f20da169'], unitTag: 'Unit-B', orderIndex: 2 },
      { name: 'Unit C (ব্যবসায় প্রশাসন)', slug: 'unit-c', unitCodes: ['UNI_d8e1d188'], unitTag: 'Unit-C', orderIndex: 3 },
      { name: 'Unit D (বিজ্ঞান ও প্রযুক্তি)', slug: 'unit-d', unitCodes: ['UNI_79515993'], unitTag: 'Unit-D', orderIndex: 4 },
    ]
  },
  {
    name: 'Mawlana Bhashani Science & Tech University (MBSTU — মাবিপ্রবি)',
    code: 'UNI_65e6f62d',
    slug: 'mbstu-question-bank',
    tag: 'MBSTU',
    units: [
      { name: 'Unit A (ইঞ্জিনিয়ারিং অনুষদ)', slug: 'unit-a', unitCodes: ['UNI_6321c505'], unitTag: 'Unit-A', orderIndex: 1 },
      { name: 'Unit B (লাইফ সায়েন্স অনুষদ)', slug: 'unit-b', unitCodes: ['UNI_f20da169'], unitTag: 'Unit-B', orderIndex: 2 },
      { name: 'Unit C (বিজ্ঞান অনুষদ)', slug: 'unit-c', unitCodes: ['UNI_d8e1d188'], unitTag: 'Unit-C', orderIndex: 3 },
      { name: 'Unit D (ব্যবসায় শিক্ষা অনুষদ)', slug: 'unit-d', unitCodes: ['UNI_79515993'], unitTag: 'Unit-D', orderIndex: 4 },
    ]
  },
  {
    name: 'Begum Rokeya University Rangpur (BRUR — বেরোবি)',
    code: 'UNI_0UER1T',
    slug: 'brur-question-bank',
    tag: 'BRUR',
    units: [
      { name: 'Unit A (কলা অনুষদ)', slug: 'unit-a', unitCodes: ['UNI_6321c505'], unitTag: 'Unit-A', orderIndex: 1 },
      { name: 'Unit B (সামাজিক বিজ্ঞান অনুষদ)', slug: 'unit-b', unitCodes: ['UNI_f20da169'], unitTag: 'Unit-B', orderIndex: 2 },
      { name: 'Unit D (বিজ্ঞান অনুষদ)', slug: 'unit-d', unitCodes: ['UNI_79515993'], unitTag: 'Unit-D', orderIndex: 3 },
      { name: 'Unit E (প্রকৌশল ও প্রযুক্তি অনুষদ)', slug: 'unit-e', unitCodes: ['UNI_7a52cb22'], unitTag: 'Unit-E', orderIndex: 4 },
      { name: 'Unit F (জীব ও ভূবিজ্ঞান অনুষদ)', slug: 'unit-f', unitCodes: ['UNI_e1b8018b'], unitTag: 'Unit-F', orderIndex: 5 },
    ]
  },
  {
    name: 'Jatiya Kabi Kazi Nazrul Islam University (JKKNIU — জাককানইবি)',
    code: 'UNI_VSHOII',
    slug: 'jkkniu-question-bank',
    tag: 'JKKNIU',
    units: [
      { name: 'Unit A (কলা অনুষদ)', slug: 'unit-a', unitCodes: ['UNI_6321c505'], unitTag: 'Unit-A', orderIndex: 1 },
      { name: 'Unit B (সামাজিক বিজ্ঞান অনুষদ)', slug: 'unit-b', unitCodes: ['UNI_f20da169'], unitTag: 'Unit-B', orderIndex: 2 },
      { name: 'Unit D (ব্যবসায় প্রশাসন অনুষদ)', slug: 'unit-d', unitCodes: ['UNI_79515993'], unitTag: 'Unit-D', orderIndex: 3 },
    ]
  },
  {
    name: 'Jashore University of Science & Technology (JUST — যবিপ্রবি)',
    code: 'UNI_H6927P',
    slug: 'just-question-bank',
    tag: 'JUST',
    units: [
      { name: 'Unit A (প্রকৌশল ও প্রযুক্তি)', slug: 'unit-a', unitCodes: ['UNI_6321c505'], unitTag: 'Unit-A', orderIndex: 1 },
      { name: 'Unit B (জীববিজ্ঞান ও প্রযুক্তি)', slug: 'unit-b', unitCodes: ['UNI_f20da169'], unitTag: 'Unit-B', orderIndex: 2 },
      { name: 'Unit C (ফলিত বিজ্ঞান ও প্রযুক্তি)', slug: 'unit-c', unitCodes: ['UNI_d8e1d188'], unitTag: 'Unit-C', orderIndex: 3 },
      { name: 'Unit D (স্বাস্থ্য বিজ্ঞান)', slug: 'unit-d', unitCodes: ['UNI_79515993'], unitTag: 'Unit-D', orderIndex: 4 },
      { name: 'Unit E (ব্যবসায় শিক্ষা)', slug: 'unit-e', unitCodes: ['UNI_7a52cb22'], unitTag: 'Unit-E', orderIndex: 5 },
    ]
  },
  {
    name: 'Pabna University of Science & Technology (PUST — পাবিপ্রবি)',
    code: 'UNI_RED610',
    slug: 'pust-question-bank',
    tag: 'PUST',
    units: [
      { name: 'Unit A (প্রকৌশল ও প্রযুক্তি অনুষদ)', slug: 'unit-a', unitCodes: ['UNI_6321c505'], unitTag: 'Unit-A', orderIndex: 1 },
      { name: 'Unit B (বিজ্ঞান অনুষদ)', slug: 'unit-b', unitCodes: ['UNI_f20da169'], unitTag: 'Unit-B', orderIndex: 2 },
      { name: 'Unit C (ব্যবসায় ও মানবিক অনুষদ)', slug: 'unit-c', unitCodes: ['UNI_d8e1d188'], unitTag: 'Unit-C', orderIndex: 3 },
    ]
  },
  {
    name: 'Patuakhali Science & Technology University (PSTU — পবিপ্রবি)',
    code: 'UNI_NJLQX2',
    slug: 'pstu-question-bank',
    tag: 'PSTU',
    units: [
      { name: 'Unit A (বিজ্ঞান ও প্রযুক্তি)', slug: 'unit-a', unitCodes: ['UNI_257efe06', 'UNI_6321c505'], unitTag: 'Unit-A', orderIndex: 1 },
    ]
  },
];

interface ScrapedOption {
  label: string;
  text: string;
  isCorrect: boolean;
}

interface ScrapedQuestion {
  dbId: string | null;
  number: string;
  questionText: string;
  meta: string;
  options: ScrapedOption[];
}

function normalizeKey(str: string): string {
  return str.replace(/\s+/g, ' ').trim().toLowerCase();
}

async function fetchJson(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, 600 * (i + 1)));
    }
  }
}

async function fetchQuestionsFromUrl(url: string, page: number): Promise<{ questions: ScrapedQuestion[]; hasMore: boolean }> {
  try {
    const fullUrl = `${url}&spa_ajax=1&page=${page}`;
    const data = await fetchJson(fullUrl);
    if (!data.html) return { questions: [], hasMore: false };

    const $ = cheerio.load(data.html);
    const questions: ScrapedQuestion[] = [];

    $('.mcq-item').each((_, el) => {
      const item = $(el);
      const dbId = item.attr('data-db-id') || null;
      const qTextEl = item.find('.mcq-question-text');
      const number = qTextEl.find('.question-number').text().trim();
      const qLink = qTextEl.find('a.spa-link');
      const questionText = qLink.text().trim() || qTextEl.text().replace(number, '').trim();
      const meta = item.find('.mcq-meta').text().trim();

      const options: ScrapedOption[] = [];
      item.find('.mcq-option-btn').each((_, optEl) => {
        const opt = $(optEl);
        options.push({
          label: opt.find('.opt-circle').text().trim(),
          text: opt.find('.opt-text').text().trim(),
          isCorrect: opt.attr('data-is-correct') === 'true'
        });
      });

      if (questionText && options.length > 0) {
        questions.push({
          dbId,
          number,
          questionText,
          meta,
          options
        });
      }
    });

    return {
      questions,
      hasMore: data.has_more ?? false
    };
  } catch (e) {
    return { questions: [], hasMore: false };
  }
}

async function getYearsForUnit(univCode: string, unitCode: string): Promise<{ year: string; yearCode: string }[]> {
  const query = new URLSearchParams({
    ajax: '1',
    step: 'year',
    university: univCode,
    unit: unitCode
  });

  try {
    const data = await fetchJson(`${AJAX_URL}?${query.toString()}`);
    const $ = cheerio.load(data.html || '');
    const years: { year: string; yearCode: string }[] = [];

    $('div[onclick], button[onclick]').each((_, el) => {
      const onclick = $(el).attr('onclick') || '';
      const yearMatch = onclick.match(/year=([^&'"]+)/);
      if (yearMatch) {
        const yearText = $(el).closest('.bg-white').find('.font-bold').text().trim() || $(el).text().trim();
        years.push({ year: yearText, yearCode: yearMatch[1] });
      }
    });

    return years;
  } catch (e) {
    return [];
  }
}

async function main() {
  const [target] = await db.select().from(qbTargets).where(eq(qbTargets.slug, 'varsity-admission'));
  if (!target) throw new Error('Target varsity-admission not found');

  const sourceCache = new Map<string, string>();
  const dbSources = await db.select().from(qbSources);
  dbSources.forEach((s) => sourceCache.set(s.slug, s.id));

  // Get or create general Subject / Chapter / Topic for fallback
  let [genSub] = await db.select().from(qbSubjects).where(eq(qbSubjects.slug, 'varsity-general-admission'));
  if (!genSub) {
    [genSub] = await db
      .insert(qbSubjects)
      .values({
        targetId: target.id,
        name: 'সাধারণ ভর্তি প্রস্তুতি (General Varsity Admission)',
        slug: 'varsity-general-admission',
        code: 'SUB_GEN_VAR',
        orderIndex: 99
      })
      .returning();
  }

  let [genChap] = await db.select().from(qbChapters).where(eq(qbChapters.slug, 'varsity-past-questions'));
  if (!genChap) {
    [genChap] = await db
      .insert(qbChapters)
      .values({
        subjectId: genSub.id,
        name: 'বিগত বছরের প্রশ্নব্যাংক (Past Admission Papers)',
        slug: 'varsity-past-questions',
        orderIndex: 1
      })
      .returning();
  }

  let [genTop] = await db.select().from(qbTopics).where(eq(qbTopics.slug, 'varsity-mcq-bank'));
  if (!genTop) {
    [genTop] = await db
      .insert(qbTopics)
      .values({
        chapterId: genChap.id,
        name: 'সকল প্রশ্নাবলি (All Question Archive)',
        slug: 'varsity-mcq-bank',
        orderIndex: 1
      })
      .returning();
  }

  for (const univ of UNIVERSITIES) {
    console.log(`\n==================================================`);
    console.log(`Processing University: ${univ.name} (${univ.slug})`);
    console.log(`==================================================`);

    const [container] = await db
      .insert(qbContainers)
      .values({
        targetId: target.id,
        name: univ.name,
        slug: univ.slug,
        description: `${univ.name} Admission Question Bank Archive`,
        orderIndex: 20
      })
      .onConflictDoUpdate({
        target: [qbContainers.targetId, qbContainers.slug],
        set: { name: univ.name }
      })
      .returning();

    for (const unit of univ.units) {
      console.log(`\n--------------------------------------------------`);
      console.log(`Processing Unit: ${unit.name} (${unit.slug})`);
      console.log(`--------------------------------------------------`);

      const [containerItem] = await db
        .insert(qbContainerItems)
        .values({
          containerId: container.id,
          name: unit.name,
          slug: unit.slug,
          description: `${univ.name} - ${unit.name} Admission Archive`,
          orderIndex: unit.orderIndex
        })
        .onConflictDoUpdate({
          target: [qbContainerItems.containerId, qbContainerItems.slug],
          set: { name: unit.name, orderIndex: unit.orderIndex }
        })
        .returning();

      let unitImported = 0;
      let unitLinked = 0;
      const seenQuestions = new Set<string>();

      for (const uCode of unit.unitCodes) {
        const years = await getYearsForUnit(univ.code, uCode);
        console.log(`Found ${years.length} year exam batches for code ${uCode} in ${unit.name}.`);

        for (const y of years) {
          const fetchUrl = `https://studyclubd.com/view-question1/?university=${univ.code}&year=${y.yearCode}&unit=${uCode}`;
          let page = 1;
          let hasMore = true;

          while (hasMore) {
            const result = await fetchQuestionsFromUrl(fetchUrl, page);
            if (result.questions.length === 0) break;

            for (const q of result.questions) {
              const qKey = normalizeKey(q.questionText);
              if (seenQuestions.has(qKey)) continue;
              seenQuestions.add(qKey);

              try {
                const [qRow] = await db
                  .insert(qbQuestions)
                  .values({
                    topicId: genTop.id,
                    qType: 'mcq',
                    questionText: q.questionText,
                    status: 'published',
                    orderIndex: parseInt(q.number) || 0
                  })
                  .returning({ id: qbQuestions.id });

                unitImported++;

                for (let i = 0; i < q.options.length; i++) {
                  const opt = q.options[i];
                  await db.insert(qbQuestionOptions).values({
                    questionId: qRow.id,
                    optionText: opt.text || opt.label || `Option ${i + 1}`,
                    isCorrect: opt.isCorrect,
                    orderIndex: i
                  });
                }

                const sSlug = `${univ.tag.toLowerCase()}-${unit.slug}-admission`;
                let sourceId = sourceCache.get(sSlug);
                if (!sourceId) {
                  const [srcRow] = await db
                    .insert(qbSources)
                    .values({
                      containerId: container.id,
                      containerItemId: containerItem.id,
                      sourceGroup: 'admission',
                      type: 'university',
                      name: `${univ.tag} ${unit.unitTag} Admission`,
                      slug: sSlug,
                      institution: univ.tag,
                      unit: unit.unitTag
                    })
                    .returning();
                  sourceId = srcRow.id;
                  sourceCache.set(sSlug, sourceId);
                }

                await db
                  .insert(qbQuestionSources)
                  .values({
                    questionId: qRow.id,
                    sourceId
                  })
                  .onConflictDoNothing();

                unitLinked++;
              } catch (err) {}
            }

            if (!result.hasMore) break;
            page++;
          }
        }
      }

      console.log(`Finished ${univ.tag} - ${unit.name}: Total Questions = ${unitImported}, Sources Linked = ${unitLinked}`);
    }
  }

  console.log('\n==================================================');
  console.log('Recalculating all database question counts...');
  await recalculateAllCounts(db);
  console.log('ALL 11 UNIVERSITIES SUCCESSFULLY INGESTED & COUNTS UPDATED!');
  console.log('==================================================');

  await client.end();
}

main().catch((err) => {
  console.error('Fatal error in import-11-universities:', err);
  process.exit(1);
});
