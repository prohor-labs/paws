import * as cheerio from 'cheerio';

const UNITS = [
  { name: 'A Unit', code: 'UNI_6321c505' },
  { name: 'B Unit', code: 'UNI_f20da169' },
  { name: 'C Unit', code: 'UNI_d8e1d188' },
];

async function inspectAllYearsAndSets() {
  for (const u of UNITS) {
    console.log(`\n================== ${u.name} (${u.code}) ==================`);
    const url = `https://studyclubd.com/qb-archive/includes/ajax.php?ajax=1&step=year&family=University&university=UNI_HSQQTE&unit=${u.code}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const json = await res.json();
    const $ = cheerio.load(json.html || '');

    console.log('--- SUBJECTS LISTED ---');
    $('[onclick*="toggleSubject"]').each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      const onclick = $(el).attr('onclick') || '';
      console.log(`  Subj: ${text} | onclick: ${onclick}`);
    });

    console.log('--- YEARS & SETS LISTED ---');
    $('[onclick*="openQbModal"]').each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      const onclick = $(el).attr('onclick') || '';
      if (onclick.includes('year=')) {
        console.log(`  Year/Set: ${text} | onclick: ${onclick}`);
      }
    });
  }
}

inspectAllYearsAndSets();
