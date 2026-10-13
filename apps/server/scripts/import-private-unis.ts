import * as cheerio from 'cheerio';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
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

interface PrivateUniDef {
  name: string;
  code: string;
  itemSlug: string;
  itemName: string;
  itemDesc: string;
  orderIndex: number;
  tag: string;
}

const PRIVATE_UNIS: PrivateUniDef[] = [
  {
    name: 'North South University (NSU)',
    code: 'UNI_LR2RA9',
    itemSlug: 'nsu',
    itemName: 'North South University (NSU)',
    itemDesc: 'North South University Undergraduate Admission Question Bank Archive',
    orderIndex: 1,
    tag: 'NSU'
  },
  {
    name: 'East West University (EWU)',
    code: 'UNI_GZJRYZ',
    itemSlug: 'ewu',
    itemName: 'East West University (EWU)',
    itemDesc: 'East West University Admission Question Bank Archive',
    orderIndex: 2,
    tag: 'EWU'
  },
  {
    name: 'Independent University, Bangladesh (IUB)',
    code: 'UNI_J8BJLR',
    itemSlug: 'iub',
    itemName: 'Independent University, Bangladesh (IUB)',
    itemDesc: 'Independent University Bangladesh Admission Question Bank Archive',
    orderIndex: 3,
    tag: 'IUB'
  },
  {
    name: 'National University (জাতীয় বিশ্ববিদ্যালয় — NU)',
    code: 'UNI_8de8e723',
    itemSlug: 'nu',
    itemName: 'National University (জাতীয় বিশ্ববিদ্যালয়)',
    itemDesc: 'National University Honours Admission Question Bank Archive',
    orderIndex: 4,
    tag: 'NU'
  },
  {
    name: 'Ahsanullah University of Science & Tech (AUST)',
    code: 'UNI_IKNLMQ',
    itemSlug: 'aust',
    itemName: 'Ahsanullah University of S&T (AUST)',
    itemDesc: 'AUST Undergraduate Admission Question Bank Archive',
    orderIndex: 5,
    tag: 'AUST'
  },
  {
    name: 'BRAC University (ব্র্যাক বিশ্ববিদ্যালয়)',
    code: 'UNI_VN1Z4Y',
    itemSlug: 'brac',
    itemName: 'BRAC University (ব্র্যাক বিশ্ববিদ্যালয়)',
    itemDesc: 'BRAC University Undergraduate Admission Question Bank Archive',
    orderIndex: 6,
    tag: 'BRAC'
  },
  {
    name: 'Bangladesh Open University (বাউবি — BOU)',
    code: 'UNI_56698f40',
    itemSlug: 'bou',
    itemName: 'Bangladesh Open University (বাউবি)',
    itemDesc: 'Bangladesh Open University Admission & Academic Question Bank Archive',
    orderIndex: 7,
    tag: 'BOU'
  },
  {
    name: 'American International University-BD (AIUB)',
    code: 'UNI_NLZF1A',
    itemSlug: 'aiub',
    itemName: 'AIUB (আমেরিকান ইন্টারন্যাশনাল ইউনিভার্সিটি)',
    itemDesc: 'AIUB Undergraduate Admission Question Bank Archive',
    orderIndex: 8,
    tag: 'AIUB'
  },
  {
    name: 'United International University (UIU)',
    code: 'UNI_2IP19E',
    itemSlug: 'uiu',
    itemName: 'United International University (UIU)',
    itemDesc: 'UIU Undergraduate Admission Question Bank Archive',
    orderIndex: 9,
    tag: 'UIU'
  }
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

async function getUnitsAndYears(univCode: string): Promise<{ unitCode?: string; unitName?: string; yearCode: string; yearText: string }[]> {
  const resUnit = await fetch(`${AJAX_URL}?ajax=1&step=unit&university=${univCode}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const unitJson = await resUnit.json();
  const $u = cheerio.load(unitJson.html || '');
  
  const units: { text: string; code: string }[] = [];
  $u('div[onclick]').each((_, el) => {
    const onclick = $u(el).attr('onclick') || '';
    const match = onclick.match(/selectUnit\('([^']+)',\s*'([^']+)'\)/);
    if (match) {
      units.push({
        text: $u(el).find('.font-bold').text().trim(),
        code: match[2]
      });
    }
  });

  const batches: { unitCode?: string; unitName?: string; yearCode: string; yearText: string }[] = [];

  if (units.length > 0) {
    for (const un of units) {
      const resYear = await fetch(`${AJAX_URL}?ajax=1&step=year&university=${univCode}&unit=${un.code}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      const yearJson = await resYear.json();
      const $y = cheerio.load(yearJson.html || '');

      $y('div[onclick], button[onclick]').each((_, el) => {
        const onclick = $y(el).attr('onclick') || '';
        const yearMatch = onclick.match(/year=([^&'"]+)/);
        if (yearMatch) {
          const yearText = $y(el).closest('.bg-white').find('.font-bold').text().trim() || $y(el).text().trim();
          batches.push({ unitCode: un.code, unitName: un.text, yearCode: yearMatch[1], yearText });
        }
      });
    }
  } else {
    const resYear = await fetch(`${AJAX_URL}?ajax=1&step=year&university=${univCode}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const yearJson = await resYear.json();
    const $y = cheerio.load(yearJson.html || '');

    $y('div[onclick], button[onclick]').each((_, el) => {
      const onclick = $y(el).attr('onclick') || '';
      const yearMatch = onclick.match(/year=([^&'"]+)/);
      if (yearMatch) {
        const yearText = $y(el).closest('.bg-white').find('.font-bold').text().trim() || $y(el).text().trim();
        batches.push({ yearCode: yearMatch[1], yearText });
      }
    });
  }

  return batches;
}

async function main() {
  const [target] = await db.select().from(qbTargets).where(eq(qbTargets.slug, 'varsity-admission'));
  if (!target) throw new Error('Target varsity-admission not found');

  const containerSlug = 'private-open-university-question-bank';
  const containerName = 'Private & Open Universities Question Bank';

  const [container] = await db
    .insert(qbContainers)
    .values({
      targetId: target.id,
      name: containerName,
      slug: containerSlug,
      description: 'North South, BRAC, EWU, IUB, AUST, AIUB, UIU, National University, Open University Question Archive',
      orderIndex: 25
    })
    .onConflictDoUpdate({
      target: [qbContainers.targetId, qbContainers.slug],
      set: { name: containerName }
    })
    .returning();

  const sourceCache = new Map<string, string>();
  const dbSources = await db.select().from(qbSources);
  dbSources.forEach((s) => sourceCache.set(s.slug, s.id));

  // Get or create general Subject / Chapter / Topic for fallback
  let [genSub] = await db.select().from(qbSubjects).where(eq(qbSubjects.slug, 'varsity-general-admission'));
  let [genChap] = await db.select().from(qbChapters).where(eq(qbChapters.slug, 'varsity-past-questions'));
  let [genTop] = await db.select().from(qbTopics).where(eq(qbTopics.slug, 'varsity-mcq-bank'));

  for (const univ of PRIVATE_UNIS) {
    console.log(`\n==================================================`);
    console.log(`Processing: ${univ.itemName} (${univ.itemSlug})`);
    console.log(`==================================================`);

    const [containerItem] = await db
      .insert(qbContainerItems)
      .values({
        containerId: container.id,
        name: univ.itemName,
        slug: univ.itemSlug,
        description: univ.itemDesc,
        orderIndex: univ.orderIndex
      })
      .onConflictDoUpdate({
        target: [qbContainerItems.containerId, qbContainerItems.slug],
        set: { name: univ.itemName, orderIndex: univ.orderIndex }
      })
      .returning();

    const batches = await getUnitsAndYears(univ.code);
    console.log(`Found ${batches.length} exam batches for ${univ.itemName}.`);

    let itemImported = 0;
    let itemLinked = 0;
    const seenQuestions = new Set<string>();

    for (const b of batches) {
      let fetchUrl = `https://studyclubd.com/view-question1/?university=${univ.code}&year=${b.yearCode}`;
      if (b.unitCode) {
        fetchUrl += `&unit=${b.unitCode}`;
      }

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
                topicId: genTop ? genTop.id : undefined,
                qType: 'mcq',
                questionText: q.questionText,
                status: 'published',
                orderIndex: parseInt(q.number) || 0
              })
              .returning({ id: qbQuestions.id });

            itemImported++;

            for (let i = 0; i < q.options.length; i++) {
              const opt = q.options[i];
              await db.insert(qbQuestionOptions).values({
                questionId: qRow.id,
                optionText: opt.text || opt.label || `Option ${i + 1}`,
                isCorrect: opt.isCorrect,
                orderIndex: i
              });
            }

            const sSlug = `${univ.tag.toLowerCase()}-${univ.itemSlug}-${(b.unitName || 'admission').toLowerCase().replace(/[^a-z0-9\u0980-\u09ff]+/g, '-')}`;
            let sourceId = sourceCache.get(sSlug);
            if (!sourceId) {
              const [srcRow] = await db
                .insert(qbSources)
                .values({
                  containerId: container.id,
                  containerItemId: containerItem.id,
                  sourceGroup: 'admission',
                  type: 'university',
                  name: `${univ.tag} ${b.unitName || 'Admission'}`,
                  slug: sSlug,
                  institution: univ.tag,
                  unit: b.unitName || undefined
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

            itemLinked++;
          } catch (err) {}
        }

        if (!result.hasMore) break;
        page++;
      }
    }

    console.log(`Finished ${univ.itemName}: Total Questions = ${itemImported}, Sources Linked = ${itemLinked}`);
  }

  console.log('\n==================================================');
  console.log('Recalculating all database question counts...');
  await recalculateAllCounts(db);
  console.log('ALL PRIVATE & OPEN UNIVERSITIES SUCCESSFULLY INGESTED!');
  console.log('==================================================');

  await client.end();
}

main().catch((err) => {
  console.error('Fatal error in import-private-unis:', err);
  process.exit(1);
});
