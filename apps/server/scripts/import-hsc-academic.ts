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
  qbQuestionSources,
} from '../src/common/database/schema/qb.js';
import { recalculateAllCounts } from '../src/modules/qb/qb-count.js';

const client = postgres('postgresql://paws:df8f13a4@127.0.0.1:5432/paws', { max: 20 });
const db = drizzle(client);

const AJAX_URL = 'https://studyclubd.com/qb-archive/includes/ajax.php';
const VIEW_URL = 'https://studyclubd.com/view-question1/';
const HSC_UNIV_CODE = 'UNI_0bda0cb2';

interface ContainerDef {
  name: string;
  slug: string;
  desc: string;
  orderIndex: number;
  items: {
    name: string;
    slug: string;
    desc: string;
    orderIndex: number;
    subjectCodes: string[];
    canonicalSubjectName: string;
    canonicalSubjectSlug: string;
  }[];
}

const HSC_CONTAINERS: ContainerDef[] = [
  {
    name: 'এইচএসসি বিজ্ঞান বিভাগ (Science)',
    slug: 'hsc-science',
    desc: 'HSC Science Division Academic Question Bank Archive',
    orderIndex: 1,
    items: [
      {
        name: 'পদার্থবিজ্ঞান (Physics)',
        slug: 'physics',
        desc: 'HSC Physics 1st & 2nd Paper',
        orderIndex: 1,
        subjectCodes: ['SUB_7e246a89', 'SUB_599bd423', 'SUB_2a8512fd'],
        canonicalSubjectName: 'পদার্থবিজ্ঞান',
        canonicalSubjectSlug: 'hsc-physics'
      },
      {
        name: 'রসায়ন (Chemistry)',
        slug: 'chemistry',
        desc: 'HSC Chemistry 1st & 2nd Paper',
        orderIndex: 2,
        subjectCodes: ['SUB_455643fa', 'SUB_9e96b95f', 'SUB_4abd849f', 'SUB_4d509433', 'SUB_65bf41af', 'SUB_44b571fc'],
        canonicalSubjectName: 'রসায়ন',
        canonicalSubjectSlug: 'hsc-chemistry'
      },
      {
        name: 'উচ্চতর গণিত (Higher Math)',
        slug: 'higher-math',
        desc: 'HSC Higher Mathematics 1st & 2nd Paper',
        orderIndex: 3,
        subjectCodes: ['SUB_084ea3ab', 'SUB_ceec274d'],
        canonicalSubjectName: 'উচ্চতর গণিত',
        canonicalSubjectSlug: 'hsc-higher-math'
      },
      {
        name: 'জীববিজ্ঞান (Biology)',
        slug: 'biology',
        desc: 'HSC Biology 1st & 2nd Paper (Botany & Zoology)',
        orderIndex: 4,
        subjectCodes: ['SUB_a2ff7d9b'],
        canonicalSubjectName: 'জীববিজ্ঞান',
        canonicalSubjectSlug: 'hsc-biology'
      },
      {
        name: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)',
        slug: 'ict',
        desc: 'HSC Information and Communication Technology',
        orderIndex: 5,
        subjectCodes: ['SUB_c0401a91', 'SUB_33beeb61'],
        canonicalSubjectName: 'তথ্য ও যোগাযোগ প্রযুক্তি',
        canonicalSubjectSlug: 'hsc-ict'
      },
      {
        name: 'বাংলা (Bangla)',
        slug: 'bangla',
        desc: 'HSC Bangla 1st & 2nd Paper',
        orderIndex: 6,
        subjectCodes: ['SUB_d3a16301', 'SUB_7f7304eb'],
        canonicalSubjectName: 'বাংলা',
        canonicalSubjectSlug: 'hsc-bangla'
      },
      {
        name: 'English',
        slug: 'english',
        desc: 'HSC English 1st & 2nd Paper',
        orderIndex: 7,
        subjectCodes: ['SUB_3acf701a'],
        canonicalSubjectName: 'English',
        canonicalSubjectSlug: 'hsc-english'
      },
      {
        name: 'পরিসংখ্যান (Statistics)',
        slug: 'statistics',
        desc: 'HSC Statistics 1st & 2nd Paper',
        orderIndex: 8,
        subjectCodes: ['SUB_5fc9de7c'],
        canonicalSubjectName: 'পরিসংখ্যান',
        canonicalSubjectSlug: 'hsc-statistics'
      },
      {
        name: 'কৃষিশিক্ষা (Agriculture)',
        slug: 'agriculture',
        desc: 'HSC Agriculture 1st & 2nd Paper',
        orderIndex: 9,
        subjectCodes: ['SUB_1fd2d6f3', 'SUB_ceadfc85', 'SUB_407d1f8a'],
        canonicalSubjectName: 'কৃষিশিক্ষা',
        canonicalSubjectSlug: 'hsc-agriculture'
      },
      {
        name: 'মনোবিজ্ঞান (Psychology)',
        slug: 'psychology',
        desc: 'HSC Psychology 1st & 2nd Paper',
        orderIndex: 10,
        subjectCodes: ['SUB_253bd6ce'],
        canonicalSubjectName: 'মনোবিজ্ঞান',
        canonicalSubjectSlug: 'hsc-psychology'
      }
    ]
  },
  {
    name: 'এইচএসসি ব্যবসায় শিক্ষা বিভাগ (Commerce)',
    slug: 'hsc-commerce',
    desc: 'HSC Business Studies Division Academic Question Bank Archive',
    orderIndex: 2,
    items: [
      {
        name: 'হিসাববিজ্ঞান (Accounting)',
        slug: 'accounting',
        desc: 'HSC Accounting 1st & 2nd Paper',
        orderIndex: 1,
        subjectCodes: ['SUB_3f627e22'],
        canonicalSubjectName: 'হিসাববিজ্ঞান',
        canonicalSubjectSlug: 'hsc-accounting'
      },
      {
        name: 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা (Business Org)',
        slug: 'business-organization',
        desc: 'HSC Business Organization & Management 1st & 2nd Paper',
        orderIndex: 2,
        subjectCodes: ['SUB_395a86d5'],
        canonicalSubjectName: 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা',
        canonicalSubjectSlug: 'hsc-business-organization'
      },
      {
        name: 'ফিন্যান্স, ব্যাংকিং ও বিমা (Finance & Banking)',
        slug: 'finance-banking',
        desc: 'HSC Finance, Banking & Insurance 1st & 2nd Paper',
        orderIndex: 3,
        subjectCodes: ['SUB_acc1f045'],
        canonicalSubjectName: 'ফিন্যান্স, ব্যাংকিং ও বিমা',
        canonicalSubjectSlug: 'hsc-finance-banking'
      },
      {
        name: 'উৎপাদন ব্যবস্থাপনা ও বিপণন (Marketing)',
        slug: 'marketing',
        desc: 'HSC Production Management & Marketing 1st & 2nd Paper',
        orderIndex: 4,
        subjectCodes: ['SUB_77c21b7c'],
        canonicalSubjectName: 'উৎপাদন ব্যবস্থাপনা ও বিপণন',
        canonicalSubjectSlug: 'hsc-marketing'
      },
      {
        name: 'অর্থনীতি (Economics)',
        slug: 'economics',
        desc: 'HSC Economics 1st & 2nd Paper',
        orderIndex: 5,
        subjectCodes: ['SUB_c1b3c31c'],
        canonicalSubjectName: 'অর্থনীতি',
        canonicalSubjectSlug: 'hsc-economics'
      },
      {
        name: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)',
        slug: 'ict',
        desc: 'HSC Information and Communication Technology',
        orderIndex: 6,
        subjectCodes: ['SUB_c0401a91', 'SUB_33beeb61'],
        canonicalSubjectName: 'তথ্য ও যোগাযোগ প্রযুক্তি',
        canonicalSubjectSlug: 'hsc-ict'
      },
      {
        name: 'বাংলা (Bangla)',
        slug: 'bangla',
        desc: 'HSC Bangla 1st & 2nd Paper',
        orderIndex: 7,
        subjectCodes: ['SUB_d3a16301', 'SUB_7f7304eb'],
        canonicalSubjectName: 'বাংলা',
        canonicalSubjectSlug: 'hsc-bangla'
      },
      {
        name: 'English',
        slug: 'english',
        desc: 'HSC English 1st & 2nd Paper',
        orderIndex: 8,
        subjectCodes: ['SUB_3acf701a'],
        canonicalSubjectName: 'English',
        canonicalSubjectSlug: 'hsc-english'
      }
    ]
  },
  {
    name: 'এইচএসসি মানবিক বিভাগ (Humanities)',
    slug: 'hsc-humanities',
    desc: 'HSC Humanities Division Academic Question Bank Archive',
    orderIndex: 3,
    items: [
      {
        name: 'অর্থনীতি (Economics)',
        slug: 'economics',
        desc: 'HSC Economics 1st & 2nd Paper',
        orderIndex: 1,
        subjectCodes: ['SUB_c1b3c31c'],
        canonicalSubjectName: 'অর্থনীতি',
        canonicalSubjectSlug: 'hsc-economics'
      },
      {
        name: 'পৌরনীতি ও সুশাসন (Civics)',
        slug: 'civics',
        desc: 'HSC Civics & Good Governance 1st & 2nd Paper',
        orderIndex: 2,
        subjectCodes: ['SUB_c7f4b6b3', 'SUB_f04dbb3f', 'SUB_de1d95ed', 'SUB_e8458ce0', 'SUB_6932d4e1', 'SUB_e40351eb', 'SUB_96550efe', 'SUB_f89a72e1', 'SUB_70df21ba', 'SUB_9f5d0a26', 'SUB_a0b9592c'],
        canonicalSubjectName: 'পৌরনীতি ও সুশাসন',
        canonicalSubjectSlug: 'hsc-civics'
      },
      {
        name: 'যুক্তিবিদ্যা (Logic)',
        slug: 'logic',
        desc: 'HSC Logic 1st & 2nd Paper',
        orderIndex: 3,
        subjectCodes: ['SUB_268cd757', 'SUB_9423cedc', 'SUB_edfd6c91', 'SUB_c295bd20', 'SUB_46fab288'],
        canonicalSubjectName: 'যুক্তিবিদ্যা',
        canonicalSubjectSlug: 'hsc-logic'
      },
      {
        name: 'ইতিহাস (History)',
        slug: 'history',
        desc: 'HSC History 1st & 2nd Paper',
        orderIndex: 4,
        subjectCodes: ['SUB_350e5023', 'SUB_543fe856'],
        canonicalSubjectName: 'ইতিহাস',
        canonicalSubjectSlug: 'hsc-history'
      },
      {
        name: 'ইসলামের ইতিহাস ও সংস্কৃতি (Islamic History)',
        slug: 'islamic-history',
        desc: 'HSC Islamic History & Culture 1st & 2nd Paper',
        orderIndex: 5,
        subjectCodes: ['SUB_e0620697', 'SUB_78c19eab'],
        canonicalSubjectName: 'ইসলামের ইতিহাস ও সংস্কৃতি',
        canonicalSubjectSlug: 'hsc-islamic-history'
      },
      {
        name: 'সমাজবিজ্ঞান (Sociology)',
        slug: 'sociology',
        desc: 'HSC Sociology 1st & 2nd Paper',
        orderIndex: 6,
        subjectCodes: ['SUB_f89a7d6e'],
        canonicalSubjectName: 'সমাজবিজ্ঞান',
        canonicalSubjectSlug: 'hsc-sociology'
      },
      {
        name: 'সমাজকর্ম (Social Work)',
        slug: 'social-work',
        desc: 'HSC Social Work 1st & 2nd Paper',
        orderIndex: 7,
        subjectCodes: ['SUB_3fcb315d'],
        canonicalSubjectName: 'সমাজকর্ম',
        canonicalSubjectSlug: 'hsc-social-work'
      },
      {
        name: 'ভূগোল (Geography)',
        slug: 'geography',
        desc: 'HSC Geography 1st & 2nd Paper',
        orderIndex: 8,
        subjectCodes: ['SUB_ccfccef3', 'SUB_afebee1a'],
        canonicalSubjectName: 'ভূগোল',
        canonicalSubjectSlug: 'hsc-geography'
      },
      {
        name: 'ইসলাম শিক্ষা (Islamic Studies)',
        slug: 'islamic-studies',
        desc: 'HSC Islamic Studies',
        orderIndex: 9,
        subjectCodes: ['SUB_5779ea56'],
        canonicalSubjectName: 'ইসলাম শিক্ষা',
        canonicalSubjectSlug: 'hsc-islamic-studies'
      },
      {
        name: 'গার্হস্থ্যবিজ্ঞান (Home Science)',
        slug: 'home-science',
        desc: 'HSC Home Science 1st & 2nd Paper',
        orderIndex: 10,
        subjectCodes: ['SUB_e66e16b7'],
        canonicalSubjectName: 'গার্হস্থ্যবিজ্ঞান',
        canonicalSubjectSlug: 'hsc-home-science'
      },
      {
        name: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)',
        slug: 'ict',
        desc: 'HSC Information and Communication Technology',
        orderIndex: 11,
        subjectCodes: ['SUB_c0401a91', 'SUB_33beeb61'],
        canonicalSubjectName: 'তথ্য ও যোগাযোগ প্রযুক্তি',
        canonicalSubjectSlug: 'hsc-ict'
      },
      {
        name: 'বাংলা (Bangla)',
        slug: 'bangla',
        desc: 'HSC Bangla 1st & 2nd Paper',
        orderIndex: 12,
        subjectCodes: ['SUB_d3a16301', 'SUB_7f7304eb'],
        canonicalSubjectName: 'বাংলা',
        canonicalSubjectSlug: 'hsc-bangla'
      },
      {
        name: 'English',
        slug: 'english',
        desc: 'HSC English 1st & 2nd Paper',
        orderIndex: 13,
        subjectCodes: ['SUB_3acf701a'],
        canonicalSubjectName: 'English',
        canonicalSubjectSlug: 'hsc-english'
      }
    ]
  }
];

interface ParsedOption {
  label: string;
  text: string;
  isCorrect: boolean;
}

interface ParsedQuestion {
  dbId: string | null;
  text: string;
  meta: string;
  options: ParsedOption[];
}

function normalizeKey(str: string): string {
  return str.replace(/\s+/g, '').toLowerCase().trim();
}

function parseMetaTags(metaStr: string) {
  const rawMatches = metaStr.match(/\[(.*?)\]/g) || [];
  const parsedSources: { institution: string; unit?: string; year?: number }[] = [];

  for (const raw of rawMatches) {
    const clean = raw.replace(/[\[\]]/g, '').trim();
    const parts = clean.split(':').map((p) => p.trim());
    const institution = parts[0] || 'HSC Board';
    let unit: string | undefined = 'HSC';
    let year: number | undefined;

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      const yNum = parseInt(part.replace(/\D/g, ''));
      if (!isNaN(yNum) && yNum > 1900 && yNum < 2100) {
        year = yNum;
      } else if (part.toLowerCase().includes('board') || part.toLowerCase().includes('set')) {
        unit = part;
      }
    }

    parsedSources.push({
      institution,
      unit: unit || 'HSC',
      year,
    });
  }

  if (parsedSources.length === 0) {
    parsedSources.push({
      institution: 'HSC Academic',
      unit: 'HSC',
      year: undefined,
    });
  }

  return parsedSources;
}

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      return await res.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise((r) => setTimeout(r, 300 * (i + 1)));
    }
  }
}

async function scrapeQuestionsForTopic(
  subjectCode: string,
  chapterCode: string,
  topicCode: string
): Promise<ParsedQuestion[]> {
  const questions: ParsedQuestion[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${VIEW_URL}?university=${HSC_UNIV_CODE}&subject=${subjectCode}&chapter=${chapterCode}&topic=${topicCode}&spa_ajax=1&page=${page}`;
    const data = await fetchWithRetry(url);
    if (!data || !data.html) break;

    const $ = cheerio.load(data.html);
    const items = $('.mcq-item');
    if (items.length === 0) break;

    items.each((_, el) => {
      const item = $(el);
      const dbId = item.attr('data-db-id') || null;
      const qTextEl = item.find('.mcq-question-text');
      const number = qTextEl.find('.question-number').text().trim();
      const qLink = qTextEl.find('a.spa-link');
      let text = qLink.text().trim() || qTextEl.text().replace(number, '').trim();
      text = text.replace(/\s+/g, ' ');
      const meta = item.find('.mcq-meta').text().trim();

      const options: ParsedOption[] = [];
      item.find('.mcq-option-btn').each((_, optEl) => {
        const opt = $(optEl);
        options.push({
          label: opt.find('.opt-circle').text().trim() || 'A',
          text: opt.find('.opt-text').text().trim(),
          isCorrect: opt.attr('data-is-correct') === 'true',
        });
      });

      if (text) {
        questions.push({ dbId, text, meta, options });
      }
    });

    hasMore = data.has_more === true || (data.total_pages && page < data.total_pages);
    page++;
  }

  return questions;
}

async function main() {
  console.log('🚀 Starting Academic HSC Ingestion Pipeline (Science, Commerce, Humanities)...');

  let [target] = await db.select().from(qbTargets).where(eq(qbTargets.slug, 'hsc'));
  if (!target) {
    [target] = await db
      .insert(qbTargets)
      .values({
        group: 'academic',
        name: 'HSC / Alim Academic',
        slug: 'hsc',
        orderIndex: 2,
      })
      .returning();
    console.log(`Initialized Target: ${target.name} (${target.slug})`);
  }

  const existingQuestions = await db.select({ id: qbQuestions.id, text: qbQuestions.questionText }).from(qbQuestions);
  const questionMap = new Map<string, string>();
  for (const q of existingQuestions) {
    questionMap.set(normalizeKey(q.text), q.id);
  }
  console.log(`Pre-loaded ${questionMap.size} existing questions for deduplication.`);

  const existingSources = await db.select().from(qbSources);
  const sourceMap = new Map<string, string>();
  for (const s of existingSources) {
    const key = `${s.institution}_${s.unit || ''}_${s.year || ''}`;
    sourceMap.set(key, s.id);
  }

  for (const containerDef of HSC_CONTAINERS) {
    console.log(`\n======================================================`);
    console.log(`📦 Processing Container: ${containerDef.name} (${containerDef.slug})`);
    console.log(`======================================================`);

    let [container] = await db
      .select()
      .from(qbContainers)
      .where(eq(qbContainers.slug, containerDef.slug));

    if (!container) {
      [container] = await db
        .insert(qbContainers)
        .values({
          targetId: target.id,
          name: containerDef.name,
          slug: containerDef.slug,
          description: containerDef.desc,
          orderIndex: containerDef.orderIndex,
        })
        .returning();
    }

    for (const itemDef of containerDef.items) {
      console.log(`\n--- Item: ${itemDef.name} (${itemDef.slug}) ---`);

      let [subject] = await db
        .select()
        .from(qbSubjects)
        .where(eq(qbSubjects.slug, itemDef.canonicalSubjectSlug));

      if (!subject) {
        [subject] = await db
          .insert(qbSubjects)
          .values({
            targetId: target.id,
            level: 'hsc',
            name: itemDef.canonicalSubjectName,
            slug: itemDef.canonicalSubjectSlug,
            code: itemDef.subjectCodes[0],
            orderIndex: itemDef.orderIndex,
          })
          .returning();
      }

      let [containerItem] = await db
        .select()
        .from(qbContainerItems)
        .where(eq(qbContainerItems.slug, itemDef.slug))
        .then((rows) => rows.filter((r) => r.containerId === container.id));

      if (!containerItem) {
        [containerItem] = await db
          .insert(qbContainerItems)
          .values({
            containerId: container.id,
            subjectId: subject.id,
            name: itemDef.name,
            slug: itemDef.slug,
            description: itemDef.desc,
            orderIndex: itemDef.orderIndex,
          })
          .returning();
      } else if (!containerItem.subjectId) {
        await db
          .update(qbContainerItems)
          .set({ subjectId: subject.id })
          .where(eq(qbContainerItems.id, containerItem.id));
      }

      for (const subjCode of itemDef.subjectCodes) {
        const chapUrl = `${AJAX_URL}?ajax=1&step=chapters&university=${HSC_UNIV_CODE}&subject=${subjCode}`;
        const chapData = await fetchWithRetry(chapUrl);
        if (!chapData || !chapData.html) continue;

        const $c = cheerio.load(chapData.html);
        const chapterList: { code: string; name: string }[] = [];

        $c('[onclick*="toggleChapter"]').each((_, el) => {
          const text = $c(el).text().trim().replace(/\s+/g, ' ');
          const name = text.replace(/\d+\s*Q.*$/, '').trim() || text;
          const onclick = $c(el).attr('onclick') || '';
          const match = onclick.match(/'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'/);
          if (match) {
            chapterList.push({ code: match[3], name });
          }
        });

        console.log(`Subject code ${subjCode}: Discovered ${chapterList.length} chapters`);

        for (let cIdx = 0; cIdx < chapterList.length; cIdx++) {
          const chap = chapterList[cIdx];
          const chapSlug = `${itemDef.canonicalSubjectSlug}-chap-${chap.code.toLowerCase()}`;

          let [chapter] = await db
            .select()
            .from(qbChapters)
            .where(eq(qbChapters.slug, chapSlug));

          if (!chapter) {
            [chapter] = await db
              .insert(qbChapters)
              .values({
                subjectId: subject.id,
                name: chap.name,
                slug: chapSlug,
                code: chap.code,
                orderIndex: cIdx + 1,
              })
              .returning();
          }

          const topUrl = `${AJAX_URL}?ajax=1&step=topics&university=${HSC_UNIV_CODE}&subject=${subjCode}&chapter=${chap.code}`;
          const topData = await fetchWithRetry(topUrl);
          if (!topData || !topData.html) continue;

          const $t = cheerio.load(topData.html);
          const topicList: { code: string; name: string }[] = [];

          $t('[onclick*="selectTopic"], a[onclick*="view-question"]').each((_, el) => {
            const text = $t(el).text().trim().replace(/\s+/g, ' ');
            const name = text.replace(/\d+\s*Q.*$/, '').trim() || text;
            const onclick = $t(el).attr('onclick') || '';
            const match = onclick.match(/topic=([^&'"]+)/) || onclick.match(/'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'/);
            if (match) {
              const code = match[1] && match[1].startsWith('TOP_') ? match[1] : match[5] || `TOP_${cIdx}`;
              topicList.push({ code, name });
            }
          });

          if (topicList.length === 0) {
            topicList.push({ code: `TOP_${chap.code}`, name: chap.name });
          }

          for (let tIdx = 0; tIdx < topicList.length; tIdx++) {
            const top = topicList[tIdx];
            const topSlug = `${chapSlug}-top-${top.code.toLowerCase()}`;

            let [topic] = await db
              .select()
              .from(qbTopics)
              .where(eq(qbTopics.slug, topSlug));

            if (!topic) {
              [topic] = await db
                .insert(qbTopics)
                .values({
                  chapterId: chapter.id,
                  name: top.name,
                  slug: topSlug,
                  code: top.code,
                  orderIndex: tIdx + 1,
                })
                .returning();
            }

            const questions = await scrapeQuestionsForTopic(subjCode, chap.code, top.code);
            if (questions.length === 0) continue;

            for (const q of questions) {
              const qKey = normalizeKey(q.text);
              let qId = questionMap.get(qKey);

              if (!qId) {
                const [newQ] = await db
                  .insert(qbQuestions)
                  .values({
                    topicId: topic.id,
                    questionType: 'mcq',
                    questionText: q.text,
                    status: 'published',
                  })
                  .returning();

                qId = newQ.id;
                questionMap.set(qKey, qId);

                if (q.options.length > 0) {
                  await db.insert(qbQuestionOptions).values(
                    q.options.map((opt, oIdx) => ({
                      questionId: qId!,
                      optionText: opt.text || opt.label,
                      isCorrect: opt.isCorrect,
                      orderIndex: oIdx + 1,
                    }))
                  );
                }
              }

              const sources = parseMetaTags(q.meta);
              for (const s of sources) {
                const sKey = `${s.institution}_${s.unit || ''}_${s.year || ''}`;
                let sId = sourceMap.get(sKey);

                if (!sId) {
                  const sSlug = `hsc-${normalizeKey(s.institution)}-${s.year || 'general'}`;
                  const [newS] = await db
                    .insert(qbSources)
                    .values({
                      containerItemId: containerItem.id,
                      sourceGroup: 'academic',
                      sourceType: 'board',
                      institution: s.institution,
                      unit: s.unit,
                      year: s.year,
                      slug: sSlug,
                      name: `${s.institution} ${s.unit || ''} ${s.year || ''}`.trim(),
                    })
                    .onConflictDoNothing()
                    .returning();

                  if (newS) {
                    sId = newS.id;
                    sourceMap.set(sKey, sId);
                  }
                }

                if (sId) {
                  await db
                    .insert(qbQuestionSources)
                    .values({
                      questionId: qId,
                      sourceId: sId,
                    })
                    .onConflictDoNothing();
                }
              }
            }
          }
        }
      }
    }
  }

  console.log('\nRecalculating all level-wise statistics...');
  await recalculateAllCounts(db);

  console.log('\n🎉 Academic HSC Ingestion Completed Successfully!');
  await client.end();
}

main().catch((err) => {
  console.error('Fatal Error during HSC Ingestion:', err);
  process.exit(1);
});
