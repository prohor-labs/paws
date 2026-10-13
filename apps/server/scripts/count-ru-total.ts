import * as cheerio from 'cheerio';

const BASE_URL = 'https://studyclubd.com/view-question1/';
const UNITS = [
  { name: 'A Unit', code: 'UNI_6321c505' },
  { name: 'B Unit', code: 'UNI_f20da169' },
  { name: 'C Unit', code: 'UNI_d8e1d188' },
];

async function countQuestionsDirectly() {
  for (const u of UNITS) {
    console.log(`\n================== Checking ALL Questions for ${u.name} (${u.code}) ==================`);
    const url = `https://studyclubd.com/qb-archive/includes/ajax.php?ajax=1&step=year&family=University&university=UNI_HSQQTE&unit=${u.code}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const json = await res.json();
    const $ = cheerio.load(json.html || '');

    const subjects: Array<{ name: string; code: string; listedCount: number }> = [];
    $('[onclick*="toggleSubject"]').each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      const onclick = $(el).attr('onclick') || '';
      const match = onclick.match(/'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'/);
      const countMatch = text.match(/(\d+)\s*Q/);
      if (match) {
        subjects.push({
          name: text,
          code: match[2],
          listedCount: countMatch ? parseInt(countMatch[1]) : 0,
        });
      }
    });

    console.log(`Total subjects listed: ${subjects.length}`);
    const sumListed = subjects.reduce((acc, s) => acc + s.listedCount, 0);
    console.log(`Sum of listed counts on page: ${sumListed}`);
  }
}

countQuestionsDirectly();
